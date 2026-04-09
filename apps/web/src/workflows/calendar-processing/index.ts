import {
  checkIsCalendar,
  extractEvents,
  markUploadFailed,
  markUploadNoEvents,
  markUploadProcessing,
  saveToDatabase,
} from "./steps";
import { serverLogger } from '@/lib/logger';

export interface CalendarProcessingInput {
  uploadId: string;
  blobUrl: string;
  fileName: string;
  fileType: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userImageUrl?: string;
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

  const logger = serverLogger.child({
    workflow: 'calendar-processing',
    uploadId: input.uploadId,
    userId: input.userId,
    fileName: input.fileName,
  });

  logger.info('Starting calendar processing workflow');

  try {
    // File is already uploaded to Vercel Blob
    const blobUrl = input.blobUrl;
    logger.debug('Using blob URL', { blobUrl });

    await markUploadProcessing(input.uploadId);

    // Step 2: Check if document is a calendar
    const isCalendar = await checkIsCalendar(blobUrl);
    logger.info('Calendar document check completed', { isCalendar });

    if (!isCalendar) {
      const failureReason = 'The uploaded file did not appear to contain a calendar or schedule.';
      await markUploadNoEvents(input.uploadId, failureReason);
      logger.warn('Document is not a calendar, ending workflow early');
      return {
        uploadId: input.uploadId,
        eventCount: 0,
        status: 'no_events'
      };
    }

    // Step 3: Extract events from the calendar
    const extractedEvents = await extractEvents(blobUrl);
    logger.info('Event extraction completed', { extractedEventCount: extractedEvents.length });

    if (extractedEvents.length === 0) {
      const failureReason = 'No calendar events were found in the uploaded document.';
      await markUploadNoEvents(input.uploadId, failureReason);
      logger.warn('No events extracted from document');
      return {
        uploadId: input.uploadId,
        eventCount: 0,
        status: 'no_events'
      };
    }

     // User ID is now provided as input

     // Step 4: Save upload and events to database
     const result = await saveToDatabase({
       uploadId: input.uploadId,
       fileName: input.fileName,
       userId: input.userId,
       userEmail: input.userEmail,
       userName: input.userName,
       userImageUrl: input.userImageUrl,
       events: extractedEvents
     });

     logger.info('Workflow completed successfully', {
       uploadId: result.uploadId,
       eventCount: extractedEvents.length,
     });
     return {
       uploadId: result.uploadId,
       eventCount: extractedEvents.length,
       status: 'completed',
       icsUrl: result.icsUrl
     };
  } catch (error) {
    await markUploadFailed(
      input.uploadId,
      error instanceof Error ? error.message : 'Unknown workflow failure.'
    );
    logger.error('Workflow failed', { error });
    return {
      uploadId: input.uploadId,
      eventCount: 0,
      status: 'failed',
    };
  }
}
