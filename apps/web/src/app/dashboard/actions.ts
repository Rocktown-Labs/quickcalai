"use server";

import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { db } from "@quickcalai/db";
import { events, uploads } from "@quickcalai/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { serverLogger } from "@/lib/logger";
import { isRecoverableFreshDatabaseError } from "@/lib/server/db-errors";

type DashboardStats = {
  totalUploads: number;
  totalEvents: number;
  completedUploads: number;
  recentUploads: Array<{
    id: string;
    fileName: string;
    status: "pending" | "processing" | "completed" | "failed" | "no_events";
    failureReason: string | null;
    createdAt: Date;
    eventCount: number;
  }>;
  hasDataError: boolean;
};

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  totalUploads: 0,
  totalEvents: 0,
  completedUploads: 0,
  recentUploads: [],
  hasDataError: true,
};

export async function getDashboardStats() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

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
            and(eq(uploads.userId, userId), eq(uploads.status, "completed")),
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
          .limit(5),
      ]);

    return {
      totalUploads: allUploads[0]?.count ?? 0,
      totalEvents: allEvents[0]?.count ?? 0,
      completedUploads: completedUploads[0]?.count ?? 0,
      recentUploads: recentUploads.map((upload) => ({
        id: upload.id,
        fileName: upload.fileName,
        status: upload.status,
        failureReason: null,
        createdAt: upload.createdAt,
        eventCount: upload.eventCount,
      })),
      hasDataError: false,
    };
  } catch (error) {
    if (isRecoverableFreshDatabaseError(error)) {
      serverLogger.warn(
        "Dashboard stats unavailable due to schema bootstrap state",
        {
          userId,
          error,
        },
      );
      return {
        ...EMPTY_DASHBOARD_STATS,
        hasDataError: false,
      };
    }

    Sentry.captureException(error, {
      tags: {
        action: "getDashboardStats",
        route: "/dashboard",
      },
      extra: {
        userId,
      },
    });

    serverLogger.error("Failed to fetch dashboard stats", { userId, error });
    return EMPTY_DASHBOARD_STATS;
  }
}
