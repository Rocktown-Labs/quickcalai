import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import type { UserSyncInput } from './index';

export async function upsertUser(input: UserSyncInput) {
  "use step";

  console.log("Upserting user:", input.clerkUserId);

  await db.insert(users).values({
    id: input.clerkUserId,
    email: input.email || `${input.clerkUserId}@placeholder.com`,
    name: input.name,
    imageUrl: input.imageUrl,
  }).onConflictDoUpdate({
    target: users.id,
    set: {
      email: input.email || `${input.clerkUserId}@placeholder.com`,
      name: input.name,
      imageUrl: input.imageUrl,
    },
  });

  console.log("User upsert completed");
}