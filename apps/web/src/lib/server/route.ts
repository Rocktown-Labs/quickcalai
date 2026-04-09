import { randomUUID } from 'crypto';
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';
import { serverLogger, toErrorDetails, type LogContext } from '@/lib/logger';

export type RouteContext = {
  requestId: string;
  route: string;
  method: string;
  userId?: string;
};

export function createRouteContext(
  route: string,
  request: Request,
  options: { userId?: string } = {}
): RouteContext {
  const requestId = request.headers.get('x-request-id')?.trim() || randomUUID();

  return {
    requestId,
    route,
    method: request.method,
    userId: options.userId,
  };
}

export async function parseJsonBody<T>(request: Request, schema: ZodType<T>) {
  const body = await request.json();
  return schema.parse(body);
}

export function jsonError(
  context: RouteContext,
  status: number,
  error: string,
  details?: LogContext
) {
  return NextResponse.json(
    {
      error,
      requestId: context.requestId,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

export function jsonSuccess<T>(context: RouteContext, data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      requestId: context.requestId,
      ...data,
    },
    init
  );
}

export function captureRouteError(
  error: unknown,
  context: RouteContext,
  extra: LogContext = {}
) {
  const errorDetails = toErrorDetails(error);

  serverLogger.error('Route handler failed', {
    ...context,
    ...extra,
    ...errorDetails,
  });

  Sentry.captureException(error, {
    tags: {
      route: context.route,
      method: context.method,
    },
    extra: {
      requestId: context.requestId,
      userId: context.userId,
      ...extra,
      ...errorDetails,
    },
  });
}

export function handleRouteError(
  error: unknown,
  context: RouteContext,
  fallbackMessage: string,
  extra: LogContext = {}
) {
  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => ({
      path: issue.path.join('.') || 'root',
      message: issue.message,
    }));

    serverLogger.warn('Invalid request payload', {
      ...context,
      ...extra,
      issues,
    });

    return jsonError(context, 400, 'Invalid request payload', { issues });
  }

  captureRouteError(error, context, extra);
  return jsonError(context, 500, fallbackMessage);
}
