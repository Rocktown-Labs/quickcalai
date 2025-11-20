-- Migration script to drop and recreate isPremium column properly
-- Run this in your database directly BEFORE running pnpm db:push

-- Step 1: Drop the existing isPremium column (which is text type)
ALTER TABLE users DROP COLUMN IF EXISTS is_premium;

-- Step 2: Verify the column was dropped
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name = 'is_premium_user';

-- After running this, run: pnpm db:push
-- Drizzle will recreate the column as boolean type properly