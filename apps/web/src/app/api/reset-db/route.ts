import { NextResponse } from 'next/server';
import { db } from '@quickcalai/db';

export async function POST() {
  try {
    // This is a dangerous operation - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    // Drop all tables in reverse dependency order
    await db.execute(`
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS uploads CASCADE;
      DROP TABLE IF EXISTS subscription_status CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TYPE IF EXISTS upload_status CASCADE;
      DROP TYPE IF EXISTS subscription_status CASCADE;
    `);

    return NextResponse.json({ message: 'Database reset successfully' });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}