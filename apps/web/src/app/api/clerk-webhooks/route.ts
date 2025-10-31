import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { start } from 'workflow/api';
import { userSyncWorkflow, type UserSyncInput } from '@/workflows/user-sync';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook
    const evt = await verifyWebhook(request);

    console.log(`Received Clerk webhook: ${evt.type}`);

    // Handle different event types
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const user = evt.data;

      const input: UserSyncInput = {
        clerkUserId: user.id,
        email: user.email_addresses?.[0]?.email_address,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || undefined,
        imageUrl: user.image_url,
      };

      // Start the user sync workflow
      const run = await start(userSyncWorkflow, [input]);
      console.log(`Started user sync workflow: ${run.runId}`);

      return new Response('User sync workflow started', { status: 200 });
    }

    if (evt.type === 'user.deleted') {
      // For deleted users, we might want to mark them as deleted or remove them
      // For now, just log it
      console.log(`User deleted: ${evt.data.id}`);
      return new Response('User deletion logged', { status: 200 });
    }

    return new Response('Event type not handled', { status: 200 });

  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return new Response('Error processing webhook', { status: 400 });
  }
}