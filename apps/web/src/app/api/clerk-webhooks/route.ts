import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { start } from 'workflow/api';
import { userSyncWorkflow, type UserSyncInput } from '@/workflows/user-sync';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from 'drizzle-orm';
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
      const userId = evt.data.id;

      if (!userId) {
        console.error('User ID missing in delete event');
        return new Response('User ID missing', { status: 400 });
      }

      // Delete user from our database
      await db.delete(users).where(eq(users.id, userId));
      console.log(`User deleted from database: ${userId}`);

      return new Response('User deleted from database', { status: 200 });
    }

    // Handle billing/subscription events
    if (evt.type === 'subscription.active' ||
        evt.type === 'subscriptionItem.active' ||
        evt.type === 'subscriptionItem.canceled' ||
        evt.type === 'subscriptionItem.ended' ||
        evt.type === 'subscriptionItem.upcoming') {

      console.log(`Billing event received: ${evt.type}`, evt.data);

      // For now, just log the billing events
      // TODO: Implement database storage for subscription status
      // The webhook data structure needs to be analyzed first
      return new Response('Billing event logged', { status: 200 });
    }

    return new Response('Event type not handled', { status: 200 });

  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return new Response('Error processing webhook', { status: 400 });
  }
}