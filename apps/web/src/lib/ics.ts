
import { createEvents, type EventAttributes } from "ics";

export interface CalendarEvent {
  date: string;
  time?: string;
  description: string;
}

export function generateICS(events: CalendarEvent[]): string {
  const icsEvents: EventAttributes[] = events.map((event) => {
    const [year, month, day] = event.date.split("-").map(Number);

    // If a specific time is provided, create a timed event with a 1-hour duration.
    if (event.time) {
      const [hour, minute] = event.time.split(":").map(Number);
      return {
        title: event.description,
        description: event.description,
        start: [year, month, day, hour, minute],
        duration: { hours: 1 },
      };
    }

    // Otherwise, create an all-day event by specifying a 1-day duration.
    return {
      title: event.description,
      description: event.description,
      start: [year, month, day], // No time components
      duration: { days: 1 }, // Add this for all-day events
    };
  });

  const { error, value } = createEvents(icsEvents);

  if (error) {
    throw new Error("Failed to generate ICS file");
  }

  return value!;
}
