import { put, head } from '@vercel/blob';
import { isDocumentCalendar, extractEventsFromDocument } from '@/lib/ai';
import { db } from '@quickcalai/db';
import { uploads, events, users } from '@quickcalai/db/schema';
import { generateICS, type CalendarEvent } from '@/lib/ics';
import { randomUUID } from 'crypto';

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
    console.error('Error fetching file from blob:', error);
    throw new Error('Failed to fetch file from Vercel Blob');
  }
}

export async function checkIsCalendar(blobUrl: string): Promise<boolean> {
  "use step";

  console.log("Checking if document is a calendar:", blobUrl);

  try {
    const { buffer, contentType } = await getFileFromBlob(blobUrl);
    const isCalendar = await isDocumentCalendar(buffer, contentType);
    return isCalendar;
  } catch (error) {
    console.error("Error checking if calendar:", error);
    return false;
  }
}

export async function extractEvents(blobUrl: string): Promise<any[]> {
  "use step";

  console.log("Extracting events from document:", blobUrl);

  try {
    const { buffer, contentType } = await getFileFromBlob(blobUrl);
    const extractedEvents = await extractEventsFromDocument(buffer, contentType);
    return extractedEvents;
  } catch (error) {
    console.error("Error extracting events:", error);
    return [];
  }
}

export interface SaveToDatabaseInput {
  fileName: string;
  fileType: string;
  storageUrl: string;
  userId: string;
  events: any[];
}

export interface SaveToDatabaseResult {
  uploadId: string;
  icsUrl?: string;
}

export async function saveToDatabase(input: SaveToDatabaseInput): Promise<SaveToDatabaseResult> {
  "use step";

  console.log("Saving to database for user:", input.userId);

  // First, ensure user exists (upsert)
  await db.insert(users).values({
    id: input.userId,
    email: `${input.userId}@placeholder.com`, // This would come from Clerk
    name: 'User', // This would come from Clerk
  }).onConflictDoNothing();

  // Create upload record ID first
  const uploadId = randomUUID();

  // Convert events to CalendarEvent format
  const calendarEvents: CalendarEvent[] = input.events.map(event => ({
    date: event.date,
    time: event.time,
    description: event.description,
  }));

  // Generate combined ICS file for all events
  const combinedIcsContent = generateICS(calendarEvents);

  // Upload ICS file to Vercel Blob
  const icsFileName = `ics/${uploadId}.ics`;
  const icsBlob = await put(icsFileName, combinedIcsContent, {
    access: 'public',
    contentType: 'text/calendar',
  });
  const icsUrl = icsBlob.url;

  // Create upload record
  await db.insert(uploads).values({
    id: uploadId,
    fileName: input.fileName,
    fileType: input.fileType,
    storageUrl: input.storageUrl,
    icsUrl: icsUrl,
    status: 'completed',
    userId: input.userId,
  });

  // Create event records
  for (const event of input.events) {
    const calendarEvent: CalendarEvent = {
      date: event.date,
      time: event.time,
      description: event.description,
    };

    const icsContent = generateICS([calendarEvent] as CalendarEvent[]);

    await db.insert(events).values({
      title: event.description,
      description: event.description,
      startTime: new Date(`${event.date}T${event.time || '00:00'}`),
      icsContent,
      uploadId,
      userId: input.userId,
    });
  }

  console.log("Database save completed");
  return { uploadId, icsUrl };
}