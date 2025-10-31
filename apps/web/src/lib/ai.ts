import { generateText } from "ai"
  ;
import { GlobalLayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
export async function isDocumentCalendar(imageBase64: string): Promise<boolean> {
  try {
    console.log("Performing pre-flight check on document type...");
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
              image: imageBase64,

            },
          ],
        },
      ],
    });

    const result = text?.trim().toLowerCase();
    console.log(`Document type check result: ${result}`);
    return result === 'yes';

  } catch (error) {
    console.error("Error during document type check:", error);
    return false;
  }
}

export interface ExtractedEvent {
  id: number;
  date: string;
  time: string;
  description: string;
}

export async function extractEventsFromImage(
  imageBase64: string,

): Promise<ExtractedEvent[]> {
  try {
    console.log("Calling Gemini API to extract events...");

    const { text } = await generateText({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze the provided calendar, schedule, or agenda. Identity all distinct events, appointments, or line items. For each item, extract the date (YYYY-MM-DD format), time (HH:MM 24 hour format), and a brief description. If a date or time is not explicitly mentioned for an item, leave the corresponding field as an empty string. Return the data as a JSON array of objects.`,
            },
            {
              type: 'image',
              image: imageBase64,
            }
          ]
        }
      ]
    });

    if (text ===undefined) {
      console.warn("Gemini API returned no text context. Returning empty array.",);
      return [];
    }

    const cleanedText = text.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
    console.log(
      'Cleaned Gemini API response:', cleanedText);

    if (cleanedText === "") {
      return [];
    }

    const parsedData: Omit<ExtractedEvent, "id">[] = JSON.parse(cleanedText);
        console.log("Parsed data:", parsedData);

        const eventsWithIds = parsedData.map((item, index) => ({
          ...item,
          id: Date.now() + index,
        }));

        console.log("Events with IDs:", eventsWithIds);
        return eventsWithIds;
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        console.error("Error details:", {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : "No stack trace",
        });

        if (error instanceof Error) {
          throw new Error(`Failed to extract data from image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while extracting data.");
      }
    }
