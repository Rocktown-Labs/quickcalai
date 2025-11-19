import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@quickcalai/db';
import { users, uploads, events } from '@quickcalai/db/schema';
import { generateICS } from '@/lib/ics';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, date, time, description } = await request.json();

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    // Create a manual upload record
    const uploadId = randomUUID();
    await db.insert(uploads).values({
      id: uploadId,
      fileName: `${title}.manual`,
      fileType: 'manual',
      storageUrl: '', // No file for manual events
      status: 'completed',
      userId,
    });

    // Create the event
    const eventDateTime = time ? `${date}T${time}` : `${date}T00:00`;
    const startTime = new Date(eventDateTime);

    // Generate ICS content
    const calendarEvent = {
      date,
      time: time || '',
      description: title + (description ? `\n\n${description}` : ''),
    };
    const icsContent = generateICS([calendarEvent]);

    await db.insert(events).values({
      title,
      description,
      startTime,
      icsContent,
      uploadId,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      eventId: randomUUID()
    });
  } catch (error) {
    console.error('Manual event creation error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}