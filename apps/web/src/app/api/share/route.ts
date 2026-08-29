import { emailFile, smsFile } from '@/app/dashboard/files/actions';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';
import { resolveRequestUserId } from '@/lib/server/native-auth';
import { serverLogger } from '@/lib/logger';

export async function POST(request: Request) {
  const { userId } = await resolveRequestUserId(request, '/api/share');
  const context = createRouteContext('/api/share', request, { userId: userId ?? undefined });
  const logger = serverLogger.child({ ...context, route: '/api/share' });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    const body = await request.json();
    const { uploadId, type, destination } = body;

    if (!uploadId || !type || !destination) {
      return jsonError(context, 400, 'Missing uploadId, type, or destination');
    }

    logger.info('Share request received', { uploadId, type, destination, userId });

    if (type === 'email') {
      const result = await emailFile(uploadId, destination, userId);
      return jsonSuccess(context, result);
    } else if (type === 'sms') {
      const result = await smsFile(uploadId, destination, userId);
      return jsonSuccess(context, result);
    } else {
      return jsonError(context, 400, 'Invalid share type');
    }
  } catch (error) {
    logger.error('Share endpoint error', { error });
    return handleRouteError(error, context, error instanceof Error ? error.message : 'Failed to share file');
  }
}
