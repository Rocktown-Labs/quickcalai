import { createClerkClient } from '@clerk/backend';
import { db } from '@quickcalai/db';
import { users, events } from '@quickcalai/db/schema';
import { generateICSForManual } from '@/lib/ics';
import { eq } from '@quickcalai/db';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess, parseJsonBody } from '@/lib/server/route';
import { manualEventSchema } from '@/lib/validators';
import { resolveRequestUserId } from '@/lib/server/native-auth';
import { serverLogger } from '@/lib/logger';

export async function POST(request: Request) {
  const { userId } = await resolveRequestUserId(request, '/api/manual-event');
  const context = createRouteContext('/api/manual-event', request, { userId: userId ?? undefined });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    const { title, date, time, description, timezone } = await parseJsonBody(request, manualEventSchema);

    // Ensure user exists in database
    // Fetch via the Clerk Backend API (works for both cookie sessions and
    // Bearer tokens from the native app, unlike currentUser()).
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
    let clerkUser;
    try {
      clerkUser = await clerk.users.getUser(userId);
    } catch {
      return jsonError(context, 404, 'User not found');
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress?.trim();

    if (!email) {
      return jsonError(context, 400, 'Authenticated user is missing an email address');
    }

    // Check if user exists, if not create them
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (existingUser.length === 0) {
      // Create user in database
      await db.insert(users).values({
        id: userId,
        email,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
        imageUrl: clerkUser.imageUrl,
        phoneNumber: clerkUser.phoneNumbers?.[0]?.phoneNumber,
        isOnboarded: true, // Assume onboarded if creating manual events
      });
    }

    // Create the event in user's timezone
    const eventDateTime = time ? `${date}T${time}` : `${date}T00:00`;

    // Parse the date/time in user's timezone
    // Create a date object that represents the user's local time
    const userLocalDate = new Date(`${eventDateTime}:00`); // Add seconds if missing

    // For storage, we'll keep it as-is since the ICS generation will handle timezone display
    // The key is to ensure the ICS file shows the correct local time
    const startTime = userLocalDate;

    // Generate ICS content with timezone awareness
    const calendarEvent = {
      date,
      time: time || '',
      description: title + (description ? `\n\n${description}` : ''),
      timezone, // Pass timezone for proper ICS generation
    };
    serverLogger.info('Creating manual calendar event', {
      ...context,
      timezone,
      date,
      hasTime: Boolean(time),
    });
    const icsContent = generateICSForManual([calendarEvent]);

    await db.insert(events).values({
      title,
      description,
      startTime,
      icsContent,
      userId,
      isAllDay: false, // Manual events are not all-day by default
      uploadId: null, // Manual events don't have an associated upload
    });

    // Return JSON response with ICS content for frontend to handle
    const fileName = `${title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()}.ics`;
    return jsonSuccess(context, {
      success: true,
      icsContent,
      fileName,
      message: 'Event created successfully',
    });
  } catch (error) {
    return handleRouteError(error, context, 'Failed to create event');
  }
}
