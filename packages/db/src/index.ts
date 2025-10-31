import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL || "");

// Export query functions
export * from './queries/users';
export * from './queries/event';
export * from './ics';
