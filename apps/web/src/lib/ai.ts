import { generateText } from "ai"
  ;
import { serverLogger } from '@/lib/logger';

export async function isDocumentCalendar(fileBuffer: Buffer, fileType: string): Promise<boolean> {
  try {
    serverLogger.info('Performing pre-flight check on document type', { fileType });

    // For PDFs, convert to base64 data URL format that Gemini can handle
    const base64Data = fileBuffer.toString('base64');
    const dataUrl = `data:${fileType};base64,${base64Data}`;

    const { text } = await generateText({
      model: 'google/gemini-2.5-pro',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze the following document. Does it primarily represent a calendar, schedule, agenda, or a list of events with dates? Please answer with only a single word: 'yes' or 'no'.`
            },
            {
              type: 'image',
              image: dataUrl,
            },
          ],
        },
      ],
    });

    const result = text?.trim().toLowerCase();
    serverLogger.info('Document type check completed', { fileType, result });
    return result === 'yes';

  } catch (error) {
    serverLogger.error('Error during document type check', { fileType, error });
    return false;
  }
}

export interface ExtractedEvent {
  id: number;
  date: string;
  time: string;
  description: string;
}

export async function extractEventsFromDocument(
  fileBuffer: Buffer,
  fileType: string,
): Promise<ExtractedEvent[]> {
  try {
    serverLogger.info('Calling model to extract events from document', { fileType });

    // Convert buffer to base64 data URL
    const base64Data = fileBuffer.toString('base64');
    const dataUrl = `data:${fileType};base64,${base64Data}`;

    const { text } = await generateText({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze the provided calendar, schedule, or agenda document. Please examine ALL pages and identify all distinct events, appointments, or line items across the entire document. For each item, extract the date (YYYY-MM-DD format), time (HH:MM 24 hour format), and a brief description. If a date or time is not explicitly mentioned for an item, leave the corresponding field as an empty string. Return the data as a JSON array of objects with no duplicates.`,
            },
            {
              type: 'image',
              image: dataUrl,
            }
          ]
        }
      ]
    });

    if (text === undefined) {
      serverLogger.warn('Model returned no text content for extraction', { fileType });
      return [];
    }

    const cleanedText = text.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
    serverLogger.debug('Received cleaned extraction response', {
      fileType,
      responseLength: cleanedText.length,
    });

    if (cleanedText === "") {
      return [];
    }

    const parsedData: Omit<ExtractedEvent, "id">[] = JSON.parse(cleanedText);

    const eventsWithIds = parsedData.map((item, index) => ({
      ...item,
      id: Date.now() + index,
    }));

    serverLogger.info('Parsed extracted events', {
      fileType,
      extractedEventCount: eventsWithIds.length,
    });
    return eventsWithIds;
  } catch (error) {
    serverLogger.error('Error calling model for event extraction', { fileType, error });

    if (error instanceof Error) {
      throw new Error(`Failed to extract data from document: ${error.message}`);
    }
    throw new Error("An unknown error occurred while extracting data.");
  }
}
