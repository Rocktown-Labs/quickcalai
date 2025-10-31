import { upsertUser } from "./steps";

export interface UserSyncInput {
  clerkUserId: string;
  email?: string;
  name?: string;
  imageUrl?: string;
}

export async function userSyncWorkflow(input: UserSyncInput) {
  "use workflow";

  console.log("Starting user sync workflow for:", input.clerkUserId);

  await upsertUser(input);

  console.log("User sync completed");
}