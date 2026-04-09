import { createEvents, type EventAttributes } from "ics";

export interface CalendarEvent {
  date: string;
  time?: string;
  description: string;
  timezone?: string;
}

// For AI-extracted events - treat times as document local time
export function generateICSForAI(events: CalendarEvent[]): string {
  const icsEvents: EventAttributes[] = events.map((event) => {
    const dateParts = event.date.split("-").map(Number);
    const [year, month, day] = dateParts;

    // Validate date parts
    if (!year || !month || !day || dateParts.some(isNaN)) {
      throw new Error(`Invalid date format: ${event.date}`);
    }

    // If a specific time is provided, create a timed event with a 1-hour duration.
    if (event.time && event.time.trim() !== '') {
      const timeParts = event.time.split(":").map(Number);
      const [hour, minute] = timeParts;

      if (timeParts.some(isNaN)) {
        throw new Error(`Invalid time format: ${event.time}`);
      }

      return {
        title: event.description,
        description: event.description,
        start: [year, month, day, hour, minute] as [number, number, number, number, number],
        duration: { hours: 1 },
      };
    }

    // Otherwise, create an all-day event by specifying a 1-day duration.
    return {
      title: event.description,
      description: event.description,
      start: [year, month, day] as [number, number, number], // No time components
      duration: { days: 1 }, // Add this for all-day events
    };
  });

  const { error, value } = createEvents(icsEvents);

  if (error) {
    throw new Error("Failed to generate ICS file for AI events");
  }

  return value!;
}

// For manual events - respect user's timezone
export function generateICSForManual(events: CalendarEvent[]): string {
  const icsEvents: EventAttributes[] = events.map((event) => {
    const dateParts = event.date.split("-").map(Number);
    const [year, month, day] = dateParts;

    // Validate date parts
    if (!year || !month || !day || dateParts.some(isNaN)) {
      throw new Error(`Invalid date format: ${event.date}`);
    }

    // If a specific time is provided, create a timed event with a 1-hour duration.
    if (event.time && event.time.trim() !== '') {
      const timeParts = event.time.split(":").map(Number);
      const [hour, minute] = timeParts;

      if (timeParts.some(isNaN)) {
        throw new Error(`Invalid time format: ${event.time}`);
      }

      return {
        title: event.description,
        description: event.description,
        start: [year, month, day, hour, minute] as [number, number, number, number, number],
        duration: { hours: 1 },
      };
    }

    // Otherwise, create an all-day event by specifying a 1-day duration.
    return {
      title: event.description,
      description: event.description,
      start: [year, month, day] as [number, number, number], // No time components
      duration: { days: 1 }, // Add this for all-day events
    };
  });

  const { error, value } = createEvents(icsEvents);

  if (error) {
    throw new Error("Failed to generate ICS file for manual events");
  }

  return value!;
}

// Legacy function - kept for backward compatibility
export function generateICS(events: CalendarEvent[]): string {
  // Default to AI extraction behavior for backward compatibility
  return generateICSForAI(events);
}
