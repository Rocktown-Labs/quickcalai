import { put } from '@vercel/blob';
import { isDocumentCalendar, extractEventsFromDocument, type ExtractedEvent } from '@/lib/ai';
import { db, updateUploadRecord } from '@quickcalai/db';
import { events, users } from '@quickcalai/db/schema';
import { generateICSForAI, type CalendarEvent } from '@/lib/ics';
import { randomUUID } from 'crypto';
import { serverLogger } from '@/lib/logger';

async function getFileFromBlob(blobUrl: string): Promise<{ buffer: Buffer, contentType: string }> {
  try {
    // Fetch the file content from the blob URL
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return { buffer, contentType };
  } catch (error) {
    serverLogger.error('Error fetching file from blob', { blobUrl, error });
    throw new Error('Failed to fetch file from Vercel Blob');
  }
}

export async function checkIsCalendar(blobUrl: string): Promise<boolean> {
  "use step";

  serverLogger.info('Checking if document is a calendar', { blobUrl });

  try {
    const { buffer, contentType } = await getFileFromBlob(blobUrl);
    const isCalendar = await isDocumentCalendar(buffer, contentType);
    return isCalendar;
  } catch (error) {
    serverLogger.error('Error checking if document is a calendar', { blobUrl, error });
    return false;
  }
}

export async function extractEvents(blobUrl: string): Promise<ExtractedEvent[]> {
  "use step";

  serverLogger.info('Extracting events from document', { blobUrl });

  try {
    const { buffer, contentType } = await getFileFromBlob(blobUrl);
    const extractedEvents = await extractEventsFromDocument(buffer, contentType);
    return extractedEvents;
  } catch (error) {
    serverLogger.error('Error extracting events from document', { blobUrl, error });
    return [];
  }
}

export interface SaveToDatabaseInput {
  uploadId: string;
  fileName: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userImageUrl?: string;
  events: ExtractedEvent[];
}

export interface SaveToDatabaseResult {
  uploadId: string;
  icsUrl?: string;
}

export async function markUploadProcessing(uploadId: string) {
  "use step";

  await updateUploadRecord(uploadId, {
    status: 'processing',
    failureReason: null,
  });
}

export async function markUploadNoEvents(uploadId: string, failureReason: string) {
  "use step";

  await updateUploadRecord(uploadId, {
    status: 'no_events',
    failureReason,
    icsUrl: null,
  });
}

export async function markUploadFailed(uploadId: string, failureReason: string) {
  "use step";

  await updateUploadRecord(uploadId, {
    status: 'failed',
    failureReason,
  });
}

export async function saveToDatabase(input: SaveToDatabaseInput): Promise<SaveToDatabaseResult> {
  "use step";

  serverLogger.info('Saving extracted events to database', {
    userId: input.userId,
    fileName: input.fileName,
    extractedEventCount: input.events.length,
  });

  // First, ensure user exists (upsert)
  await db.insert(users).values({
    id: input.userId,
    email: input.userEmail,
    name: input.userName,
    imageUrl: input.userImageUrl,
  }).onConflictDoUpdate({
    target: users.id,
    set: {
      email: input.userEmail,
      name: input.userName,
      imageUrl: input.userImageUrl,
    },
  });

  // Convert events to CalendarEvent format, filtering out events with empty dates
  const calendarEvents: CalendarEvent[] = input.events
    .filter(event => event.date && event.date.trim() !== '') // Filter out events with empty dates
    .map(event => ({
      date: event.date,
      time: event.time,
      description: event.description,
    }));

  // Generate combined ICS file for all events
  const combinedIcsContent = generateICSForAI(calendarEvents);

  // Create a temporary ID for the ICS filename (will be replaced with actual DB ID)
  const tempId = randomUUID();

  // Upload ICS file to Vercel Blob
  const icsFileName = `ics/${tempId}.ics`;
  const icsBlob = await put(icsFileName, combinedIcsContent, {
    access: 'public',
    contentType: 'text/calendar',
  });
  const icsUrl = icsBlob.url;

  // Create event records (only for events with valid dates)
  for (const event of input.events.filter(event => event.date && event.date.trim() !== '')) {
    const calendarEvent: CalendarEvent = {
      date: event.date,
      time: event.time,
      description: event.description,
    };

    const icsContent = generateICSForAI([calendarEvent] as CalendarEvent[]);

    await db.insert(events).values({
      title: event.description,
      description: event.description,
      startTime: new Date(`${event.date}T${event.time || '00:00'}:00Z`), // Treat as UTC
      icsContent,
      uploadId: input.uploadId,
      userId: input.userId,
    });
  }

  await updateUploadRecord(input.uploadId, {
    status: 'completed',
    icsUrl,
    failureReason: null,
  });

  serverLogger.info('Database save completed', {
    userId: input.userId,
    uploadId: input.uploadId,
  });
  return { uploadId: input.uploadId, icsUrl };
}
