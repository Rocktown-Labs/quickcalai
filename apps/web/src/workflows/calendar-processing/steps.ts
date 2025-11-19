import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { isDocumentCalendar, extractEventsFromDocument } from '@/lib/ai';
import { db } from '@quickcalai/db';
import { uploads, events, users } from '@quickcalai/db/schema';
import { generateICS, type CalendarEvent } from '@/lib/ics';
import { randomUUID } from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

async function getFileFromS3(s3Url: string): Promise<{ buffer: Buffer, contentType: string }> {
  const urlParts = s3Url.split('/');
  const key = urlParts.slice(3).join('/'); // Remove the domain and bucket parts

  const command = new GetObjectCommand({
    Bucket: 'quickcalai-dev-quickcaluploadsbucket-rkfdrxet',
    Key: key,
  });

  const response = await s3Client.send(command);
  const uint8Array = await response.Body?.transformToByteArray();

  if (!uint8Array) {
    throw new Error('Failed to fetch file from S3');
  }

  const buffer = Buffer.from(uint8Array);
  const contentType = response.ContentType || 'application/octet-stream';

  return { buffer, contentType };
}

export async function checkIsCalendar(s3Url: string): Promise<boolean> {
  "use step";

  console.log("Checking if document is a calendar:", s3Url);

  try {
    const { buffer, contentType } = await getFileFromS3(s3Url);
    const isCalendar = await isDocumentCalendar(buffer, contentType);
    return isCalendar;
  } catch (error) {
    console.error("Error checking if calendar:", error);
    return false;
  }
}

export async function extractEvents(s3Url: string): Promise<any[]> {
  "use step";

  console.log("Extracting events from document:", s3Url);

  try {
    const { buffer, contentType } = await getFileFromS3(s3Url);
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

export async function saveToDatabase(input: SaveToDatabaseInput): Promise<{ uploadId: string }> {
  "use step";

  console.log("Saving to database for user:", input.userId);

  // First, ensure user exists (upsert)
  await db.insert(users).values({
    id: input.userId,
    email: `${input.userId}@placeholder.com`, // This would come from Clerk
    name: 'User', // This would come from Clerk
  }).onConflictDoNothing();

  // Create upload record
  const uploadId = randomUUID();
  await db.insert(uploads).values({
    id: uploadId,
    fileName: input.fileName,
    fileType: input.fileType,
    storageUrl: input.storageUrl,
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
  return { uploadId };
}