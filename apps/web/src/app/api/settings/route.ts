import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, email, phone } = await request.json();

    // Check if the email is already used by another user
    if (email) {
      const existingUser = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser[0] && existingUser[0].id !== userId) {
        return NextResponse.json({
          error: 'This email address is already in use by another account'
        }, { status: 400 });
      }
    }

    // Update user information in our database
    await db.update(users)
      .set({
        email,
        name: `${firstName} ${lastName}`.trim(),
        phoneNumber: phone,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}