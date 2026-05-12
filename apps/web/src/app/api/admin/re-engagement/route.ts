import { NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { sendReEngagementEmail } from '@/lib/server/notifications';
import { serverLogger } from '@/lib/logger';
import { createRouteContext, jsonError, jsonSuccess } from '@/lib/server/route';

const ADMIN_EMAIL = 'cg@rocktownlabs.com';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const context = createRouteContext('/api/admin/re-engagement', request, { userId: userId ?? undefined });
  const logger = serverLogger.child(context);

  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (userEmail !== ADMIN_EMAIL) {
      logger.warn('Unauthorized re-engagement attempt', { userEmail, userId });
      return jsonError(context, 403, 'Forbidden');
    }

    // Parse optional batch size limit
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(body.limit || 50, 100); // Max 100 per request

    logger.info('Starting re-engagement campaign', { limit });

    // Get all users
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
    }).from(users);

    const targetUsers = allUsers.slice(0, limit);
    const results = { sent: 0, failed: 0, errors: [] as string[] };

    // Send emails sequentially to avoid rate limits
    for (const user of targetUsers) {
      try {
        await sendReEngagementEmail({
          userId: user.id,
          to: user.email,
          name: user.name?.split(' ')[0] || '',
        });
        results.sent++;
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${user.email}: ${errorMessage}`);
        logger.error('Failed to send re-engagement email', { userId: user.id, error: errorMessage });
      }
    }

    logger.info('Re-engagement campaign complete', results);

    return jsonSuccess(context, {
      message: 'Re-engagement campaign complete',
      totalUsers: allUsers.length,
      processed: targetUsers.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    logger.error('Re-engagement campaign failed', { error });
    return jsonError(context, 500, 'Failed to run re-engagement campaign');
  }
}