import { auth } from '@clerk/nextjs/server';
import { db } from '@quickcalai/db';
import { events, uploads, users } from '@quickcalai/db/schema';
import { and, desc, eq, sql } from '@quickcalai/db';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';
import { serverLogger } from '@/lib/logger';
import { isRecoverableFreshDatabaseError } from '@/lib/server/db-errors';

type DashboardStatsResponse = {
  totalUploads: number;
  totalEvents: number;
  completedUploads: number;
  recentUploads: Array<{
    id: string;
    fileName: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'no_events';
    createdAt: Date;
    eventCount: number;
  }>;
  isPremium: boolean;
  hasDataError: boolean;
};

const EMPTY_STATS = {
  totalUploads: 0,
  totalEvents: 0,
  completedUploads: 0,
  recentUploads: [],
  isPremium: false,
  hasDataError: true,
};

export async function GET(request: Request) {
  const { userId } = await auth();
  const context = createRouteContext('/api/user/dashboard-stats', request, { userId: userId ?? undefined });
  const logger = serverLogger.child({ ...context, route: '/api/user/dashboard-stats' });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    logger.info('Fetching dashboard stats for mobile API', { userId });

    // 1. Fetch user premium status
    const dbUser = await db
      .select({ isPremiumUser: users.isPremiumUser })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const isPremium = dbUser[0]?.isPremiumUser ?? false;

    // 2. Fetch stats and recent activity
    try {
      const [allUploads, allEvents, completedUploads, recentUploads] =
        await Promise.all([
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(uploads)
            .where(eq(uploads.userId, userId)),
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(events)
            .where(eq(events.userId, userId)),
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(uploads)
            .where(
              and(eq(uploads.userId, userId), eq(uploads.status, 'completed')),
            ),
          db
            .select({
              id: uploads.id,
              fileName: uploads.fileName,
              status: uploads.status,
              createdAt: uploads.createdAt,
              eventCount: sql<number>`count(${events.id})::int`,
            })
            .from(uploads)
            .leftJoin(
              events,
              and(eq(events.uploadId, uploads.id), eq(events.userId, userId)),
            )
            .where(eq(uploads.userId, userId))
            .groupBy(
              uploads.id,
              uploads.fileName,
              uploads.status,
              uploads.createdAt,
            )
            .orderBy(desc(uploads.createdAt))
            .limit(10),
        ]);

      return jsonSuccess(context, {
        totalUploads: allUploads[0]?.count ?? 0,
        totalEvents: allEvents[0]?.count ?? 0,
        completedUploads: completedUploads[0]?.count ?? 0,
        recentUploads: recentUploads.map((upload) => ({
          id: upload.id,
          fileName: upload.fileName,
          status: upload.status,
          createdAt: upload.createdAt,
          eventCount: upload.eventCount,
        })),
        isPremium,
        hasDataError: false,
      });
    } catch (dbError) {
      if (isRecoverableFreshDatabaseError(dbError)) {
        logger.warn('Database not bootstrapped yet', { userId, dbError });
        return jsonSuccess(context, {
          ...EMPTY_STATS,
          isPremium,
          hasDataError: false,
        });
      }
      throw dbError;
    }
  } catch (error) {
    logger.error('Failed to resolve dashboard stats API', { error });
    return handleRouteError(error, context, 'Failed to fetch dashboard stats');
  }
}
