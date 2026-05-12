import { NextRequest } from 'next/server';
import { db } from '@quickcalai/db';
import { uploads, events } from '@quickcalai/db/schema';
import { getUploadByShareToken } from '@quickcalai/db/queries/uploads';
import { eq } from '@quickcalai/db';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';
import { serverLogger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const context = createRouteContext('/api/share/[token]', request);
  const logger = serverLogger.child({ ...context, route: '/api/share/[token]' });

  try {
    const { token } = await params;

    if (!token || token.length < 4) {
      return jsonError(context, 400, 'Invalid share token');
    }

    logger.info('Resolving shared upload', { token });

    const upload = await getUploadByShareToken(token);

    if (!upload) {
      logger.warn('Share token not found', { token });
      return jsonError(context, 404, 'Shared schedule not found');
    }

    if (upload.status !== 'completed') {
      return jsonError(context, 403, 'This schedule is not ready for sharing yet');
    }

    const uploadEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        startTime: events.startTime,
        endTime: events.endTime,
        isAllDay: events.isAllDay,
      })
      .from(events)
      .where(eq(events.uploadId, upload.id))
      .orderBy(events.startTime);

    logger.info('Shared upload resolved', {
      uploadId: upload.id,
      eventCount: uploadEvents.length,
    });

    return jsonSuccess(context, {
      upload: {
        id: upload.id,
        fileName: upload.fileName,
        eventCount: uploadEvents.length,
        createdAt: upload.createdAt,
      },
      events: uploadEvents.map((event) => ({
        ...event,
        startTime: event.startTime?.toISOString() ?? null,
        endTime: event.endTime?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    logger.error('Failed to resolve shared upload', { error });
    return handleRouteError(error, context, 'Failed to load shared schedule');
  }
}