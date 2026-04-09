import { drizzle } from "drizzle-orm/node-postgres";

type DbInstance = ReturnType<typeof drizzle>;

let _db: DbInstance | undefined;

function getDb(): DbInstance {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for database access');
    }
    _db = drizzle(databaseUrl);
  }
  return _db;
}

export const db = new Proxy({} as DbInstance, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance, prop);
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(instance);
    }
    return value;
  },
});

// Export query functions
export * from './queries/users';
export * from './queries/uploads';
export * from './ics';
