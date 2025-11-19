import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, phone, accountType } = await request.json();

    if (!email || !phone || !accountType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clerkClient();

    // Update Clerk user metadata to mark onboarding as complete
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        accountType,
      },
    });

    // Also update our database
    await db.update(users)
      .set({
        email,
        phoneNumber: phone,
        accountType,
        isOnboarded: true,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}