import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@quickcalai/db';

export async function POST() {
  try {
    // This is a dangerous operation - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    // Drop all tables and types in reverse dependency order
    await db.execute(sql`DROP TABLE IF EXISTS events CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS uploads CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS subscription_status CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS upload_status CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS subscription_status CASCADE`);

    return NextResponse.json({ message: 'Database reset successfully' });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}