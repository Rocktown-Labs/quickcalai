import { auth } from '@clerk/nextjs/server';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user premium status from database
    const dbUser = await db
      .select({ isPremium: users.isPremium })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!dbUser[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPremium = dbUser[0].isPremium;

    return NextResponse.json({ isPremium });
  } catch (error) {
    console.error('Error checking premium status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}