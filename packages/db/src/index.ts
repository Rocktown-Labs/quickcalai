import { drizzle } from "drizzle-orm/node-postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for database access');
}

export const db = drizzle(databaseUrl);

// Export query functions
export * from './queries/users';
export * from './queries/uploads';
export * from './ics';
