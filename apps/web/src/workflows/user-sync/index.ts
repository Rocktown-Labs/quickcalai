import { upsertUser } from "./steps";
import { serverLogger } from '@/lib/logger';

export interface UserSyncInput {
  clerkUserId: string;
  email?: string;
  name?: string;
  imageUrl?: string;
}

export async function userSyncWorkflow(input: UserSyncInput) {
  "use workflow";

  const logger = serverLogger.child({
    workflow: 'user-sync',
    clerkUserId: input.clerkUserId,
  });

  logger.info('Starting user sync workflow');

  await upsertUser(input);

  logger.info('User sync completed');
}
