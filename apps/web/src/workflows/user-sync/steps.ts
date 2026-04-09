import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import type { UserSyncInput } from './index';
import { serverLogger } from '@/lib/logger';

export async function upsertUser(input: UserSyncInput) {
  "use step";

  serverLogger.info('Upserting user from workflow', { clerkUserId: input.clerkUserId });

  await db.insert(users).values({
    id: input.clerkUserId,
    email: input.email || `${input.clerkUserId}@clerk.local`,
    name: input.name,
    imageUrl: input.imageUrl,
  }).onConflictDoUpdate({
    target: users.id,
    set: {
      email: input.email || `${input.clerkUserId}@clerk.local`,
      name: input.name,
      imageUrl: input.imageUrl,
    },
  });

  serverLogger.info('User upsert completed', { clerkUserId: input.clerkUserId });
}
