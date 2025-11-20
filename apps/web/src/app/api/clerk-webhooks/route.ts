import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { start } from 'workflow/api';
import { userSyncWorkflow, type UserSyncInput } from '@/workflows/user-sync';
import { db } from '@quickcalai/db';
import { users, subscriptionStatus } from '@quickcalai/db/schema';
import { eq } from 'drizzle-orm';
import { serverLogger } from '@/lib/logger';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook
    const evt = await verifyWebhook(request);

    serverLogger.log(`Received Clerk webhook: ${evt.type}`);

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
      serverLogger.log(`Started user sync workflow: ${run.runId}`);

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
      serverLogger.log(`User deleted from database: ${userId}`);

      return new Response('User deleted from database', { status: 200 });
    }

    // Handle billing/subscription events
    if (evt.type.startsWith('subscription') || evt.type.startsWith('subscriptionItem')) {
      serverLogger.log(`Billing event received: ${evt.type}`);

      try {
        // Handle subscription item events (these contain the actual subscription details)
        if (evt.type.startsWith('subscriptionItem')) {
          const eventData = evt.data as any; // Type assertion for billing events

          const userId = eventData.payer?.user_id;
          if (!userId) {
            serverLogger.error('No user ID found in subscription item event');
            return new Response('No user ID in event', { status: 400 });
          }

          // Map Clerk status to our enum
          let status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'ended' | 'upcoming' | 'free' = 'free';
          switch (eventData.status) {
            case 'active':
              status = 'active';
              break;
            case 'canceled':
              status = 'canceled';
              break;
            case 'past_due':
              status = 'past_due';
              break;
            case 'incomplete':
              status = 'incomplete';
              break;
            case 'ended':
              status = 'ended';
              break;
            case 'upcoming':
              status = 'upcoming';
              break;
            default:
              status = 'free';
          }

          // Upsert subscription status
          await db.insert(subscriptionStatus).values({
            userId,
            clerkSubscriptionId: eventData.subscription_id,
            clerkSubscriptionItemId: eventData.id,
            planId: eventData.plan_id,
            status,
            isActive: status === 'active',
            periodStart: eventData.period_start ? new Date(eventData.period_start * 1000) : null,
            periodEnd: eventData.period_end ? new Date(eventData.period_end * 1000) : null,
            canceledAt: eventData.canceled_at ? new Date(eventData.canceled_at * 1000) : null,
          }).onConflictDoUpdate({
            target: [subscriptionStatus.clerkSubscriptionItemId],
            set: {
              status,
              isActive: status === 'active',
              periodStart: eventData.period_start ? new Date(eventData.period_start * 1000) : null,
              periodEnd: eventData.period_end ? new Date(eventData.period_end * 1000) : null,
              canceledAt: eventData.canceled_at ? new Date(eventData.canceled_at * 1000) : null,
              updatedAt: new Date(),
            },
          });

          // Update user's account type based on subscription
          const accountType = status === 'active' ? 'premium' : 'free';
          await db.update(users)
            .set({ accountType })
            .where(eq(users.id, userId));

          serverLogger.log(`Updated subscription status for user ${userId}: ${status}`);
        }

        return new Response('Subscription event processed', { status: 200 });

      } catch (error) {
        serverLogger.error('Error processing subscription event:', error);
        return new Response('Error processing subscription event', { status: 500 });
      }
    }

    return new Response('Event type not handled', { status: 200 });

  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return new Response('Error processing webhook', { status: 400 });
  }
}