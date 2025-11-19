import { createWebhook } from "workflow";
import { checkIsCalendar, extractEvents, saveToDatabase } from "./steps";

export interface CalendarProcessingInput {
  blobUrl: string;
  fileName: string;
  fileType: string;
  userId: string;
}

export interface CalendarProcessingResult {
  uploadId: string;
  eventCount: number;
  status: 'completed' | 'no_events' | 'failed';
  icsUrl?: string;
}

export async function calendarProcessingWorkflow(
  input: CalendarProcessingInput
): Promise<CalendarProcessingResult> {
  "use workflow";

  console.log("Starting calendar processing workflow for file:", input.fileName);

  // File is already uploaded to Vercel Blob
  const blobUrl = input.blobUrl;
  console.log("Using blob URL:", blobUrl);

  // Step 2: Check if document is a calendar
  const isCalendar = await checkIsCalendar(blobUrl);
  console.log("Is calendar:", isCalendar);

  if (!isCalendar) {
    console.log("Document is not a calendar, ending workflow");
    return {
      uploadId: '',
      eventCount: 0,
      status: 'no_events'
    };
  }

  // Step 3: Extract events from the calendar
  const extractedEvents = await extractEvents(blobUrl);
  console.log("Extracted events:", extractedEvents.length);

  if (extractedEvents.length === 0) {
    console.log("No events extracted, ending workflow");
    return {
      uploadId: '',
      eventCount: 0,
      status: 'no_events'
    };
  }

   // User ID is now provided as input

   // Step 4: Save upload and events to database
   const result = await saveToDatabase({
     fileName: input.fileName,
     fileType: input.fileType,
     storageUrl: blobUrl,
     userId: input.userId,
     events: extractedEvents
   });

   console.log("Workflow completed successfully");
   return {
     uploadId: result.uploadId,
     eventCount: extractedEvents.length,
     status: 'completed',
     icsUrl: result.icsUrl
   };
}