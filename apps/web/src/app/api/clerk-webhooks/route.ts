import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { db } from '@quickcalai/db';
import { users, subscriptionStatus } from '@quickcalai/db/schema';
import { eq } from 'drizzle-orm';
import { serverLogger } from '@/lib/logger';
import { createRouteContext, captureRouteError } from '@/lib/server/route';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const context = createRouteContext('/api/clerk-webhooks', request);

  try {
    // Verify the webhook
    const evt = await verifyWebhook(request as any);

    const logger = serverLogger.child({
      ...context,
      eventType: evt.type,
    });

    logger.info('Received Clerk webhook');

    // Handle different event types
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const user = evt.data;

      try {
        // Sync user directly to database (more reliable than workflows)
        await db.insert(users).values({
          id: user.id,
          email: user.email_addresses?.[0]?.email_address || `${user.id}@clerk.local`,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || undefined,
          imageUrl: user.image_url,
        }).onConflictDoUpdate({
          target: users.id,
          set: {
            email: user.email_addresses?.[0]?.email_address || `${user.id}@clerk.local`,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || undefined,
            imageUrl: user.image_url,
          },
        });

        logger.info('User synced to database', { syncedUserId: user.id });
        return new Response('User synced to database', { status: 200 });
      } catch (error) {
        captureRouteError(error, context, {
          eventType: evt.type,
          syncedUserId: user.id,
        });
        return new Response('Error syncing user', { status: 500 });
      }
    }

    if (evt.type === 'user.deleted') {
      const userId = evt.data.id;

      if (!userId) {
        logger.warn('User ID missing in delete event');
        return new Response('User ID missing', { status: 400 });
      }

      // Delete user from our database
      await db.delete(users).where(eq(users.id, userId));
      logger.info('User deleted from database', { syncedUserId: userId });

      return new Response('User deleted from database', { status: 200 });
    }

    // Handle billing/subscription events
    if (evt.type.startsWith('subscription') || evt.type.startsWith('subscriptionItem')) {
      const eventData = evt.data as any; // Type assertion for billing events

      logger.info('Billing event received', {
        userId: eventData.user_id || eventData.payer?.user_id || eventData.customer?.id,
        status: eventData.status,
        subscriptionId: eventData.subscription_id || eventData.id,
        planId: eventData.plan_id,
        eventData,
      });

      try {
        // Extract user ID from multiple possible fields (Clerk uses different structures)
        const userId = eventData.user_id || eventData.payer?.user_id || eventData.customer?.id;

        if (!userId) {
          logger.error('No user ID found in subscription event', {
            eventType: evt.type,
            availableFields: Object.keys(eventData),
          });
          return new Response('No user ID in event', { status: 400 });
        }

        // Map Clerk event types to our status enum
        let status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'ended' | 'upcoming' | 'free' = 'free';

        // Handle subscription-level events
        if (evt.type === 'subscription.active') {
          status = 'active';
        } else if (evt.type === 'subscription.pastDue') {
          status = 'past_due';
        }
        // Handle subscription item events
        else if (evt.type === 'subscriptionItem.active') {
          status = 'active';
        } else if (evt.type === 'subscriptionItem.canceled') {
          status = 'canceled';
        } else if (evt.type === 'subscriptionItem.ended') {
          status = 'ended';
        } else if (evt.type === 'subscriptionItem.pastDue') {
          status = 'past_due';
        } else if (evt.type === 'subscriptionItem.incomplete') {
          status = 'incomplete';
        } else if (evt.type === 'subscriptionItem.upcoming') {
          status = 'upcoming';
        } else {
          // For other events, try to extract status from eventData
          const eventStatus = eventData.status;
          switch (eventStatus) {
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
        }

        // Update subscription status table for subscriptionItem events
        if (evt.type.startsWith('subscriptionItem')) {
          const existingSubscriptionItem = await db
            .select({ id: subscriptionStatus.id })
            .from(subscriptionStatus)
            .where(eq(subscriptionStatus.clerkSubscriptionItemId, eventData.id))
            .limit(1);

          const subscriptionValues = {
            userId,
            clerkSubscriptionId: eventData.subscription_id,
            clerkSubscriptionItemId: eventData.id,
            planId: eventData.plan_id,
            status,
            isActive: status === 'active',
            periodStart: eventData.period_start ? new Date(eventData.period_start * 1000) : null,
            periodEnd: eventData.period_end ? new Date(eventData.period_end * 1000) : null,
            canceledAt: eventData.canceled_at ? new Date(eventData.canceled_at * 1000) : null,
          };

          if (existingSubscriptionItem[0]) {
            await db.update(subscriptionStatus)
              .set({
                ...subscriptionValues,
                updatedAt: new Date(),
              })
              .where(eq(subscriptionStatus.id, existingSubscriptionItem[0].id));
          } else {
            await db.insert(subscriptionStatus).values(subscriptionValues);
          }
        }

        // Update user's premium status based on subscription status
        const isPremiumUser = status === 'active';
        await db.update(users)
          .set({ isPremiumUser })
          .where(eq(users.id, userId));

        logger.info('Updated subscription status', {
          userId,
          status,
          eventType: evt.type,
        });

        return new Response('Subscription event processed', { status: 200 });

      } catch (error) {
        captureRouteError(error, context, {
          eventType: evt.type,
        });
        return new Response('Error processing subscription event', { status: 500 });
      }
    }

    return new Response('Event type not handled', { status: 200 });

  } catch (error) {
    captureRouteError(error, context);
    return new Response('Error processing webhook', { status: 400 });
  }
}
