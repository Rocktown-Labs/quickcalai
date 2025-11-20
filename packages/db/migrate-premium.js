import { sql } from 'drizzle-orm';
import { db } from '@quickcalai/db';

async function migrateAccountTypeToIsPremium() {
  try {
    console.log('Starting migration: accountType -> isPremium');

    // Add the new is_premium column
    await db.execute(sql`ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT false`);

    // Migrate existing data
    await db.execute(sql`
      UPDATE users
      SET is_premium = CASE
        WHEN "accountType" = 'premium' THEN true
        ELSE false
      END
    `);

    // Drop the old column
    await db.execute(sql`ALTER TABLE users DROP COLUMN "accountType"`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateAccountTypeToIsPremium();