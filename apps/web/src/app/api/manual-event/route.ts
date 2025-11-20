import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@quickcalai/db';
import { users, uploads, events } from '@quickcalai/db/schema';
import { generateICSForManual } from '@/lib/ics';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, date, time, description, timezone } = await request.json();

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    // Ensure user exists in database
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user exists, if not create them
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (existingUser.length === 0) {
      // Create user in database
      await db.insert(users).values({
        id: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
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
    console.log('Creating calendar event:', calendarEvent, 'in timezone:', timezone);
    const icsContent = generateICSForManual([calendarEvent]);
    console.log('Generated ICS content:', icsContent.substring(0, 200));

    await db.insert(events).values({
      title,
      description,
      startTime,
      icsContent,
      userId,
      isAllDay: false, // Manual events are not all-day by default
      uploadId: null as any, // Manual events don't have an associated upload
    });

    // Return ICS file directly as downloadable attachment
    const fileName = `${title.replace(/[^a-zA-Z0-9\s]/g, '_').trim()}.ics`;
    return new Response(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Manual event creation error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}