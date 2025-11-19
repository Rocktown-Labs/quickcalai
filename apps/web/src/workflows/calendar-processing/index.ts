import { createWebhook } from "workflow";
import { checkIsCalendar, extractEvents, saveToDatabase } from "./steps";

export interface CalendarProcessingInput {
  s3Url: string;
  fileName: string;
  fileType: string;
  userId: string;
}

export interface CalendarProcessingResult {
  uploadId: string;
  eventCount: number;
  status: 'completed' | 'no_events' | 'failed';
  webhookUrl?: string;
}

export async function calendarProcessingWorkflow(
  input: CalendarProcessingInput
): Promise<CalendarProcessingResult> {
  "use workflow";

  console.log("Starting calendar processing workflow for file:", input.fileName);

  // File is already uploaded to S3
  const s3Url = input.s3Url;
  console.log("Using S3 URL:", s3Url);

  // Step 2: Check if document is a calendar
  const isCalendar = await checkIsCalendar(s3Url);
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
  const extractedEvents = await extractEvents(s3Url);
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
     storageUrl: s3Url,
     userId: input.userId,
     events: extractedEvents
   });

  console.log("Workflow completed successfully");
  return {
    uploadId: result.uploadId,
    eventCount: extractedEvents.length,
    status: 'completed'
  };
}