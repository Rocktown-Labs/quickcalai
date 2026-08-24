import { verifyToken } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { serverLogger, toErrorDetails } from '@/lib/logger';

export type RequestUserId = {
  userId?: string;
};

/**
 * Resolve the acting user for an API request.
 *
 * Native clients (@clerk/expo) authenticate with a Clerk session JWT sent as
 * `Authorization: Bearer <token>`. The Next.js `auth()` helper only reads
 * session cookies, so Bearer tokens are verified explicitly with
 * `verifyToken` from @clerk/backend. Browser requests (no Authorization
 * header) fall back to cookie-based session auth.
 */
export async function resolveRequestUserId(
  request: Request,
  route: string,
): Promise<RequestUserId> {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    const { userId } = await auth();
    return { userId: userId ?? undefined };
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    return {};
  }

  try {
    const { payload } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    // `payload` can degrade to `unknown` depending on TS module resolution,
    // so read `sub` defensively.
    const sub = (payload as { sub?: string } | undefined)?.sub;
    return { userId: sub };
  } catch (error) {
    // Decode the token's claims (without verifying) to aid diagnosis.
    let claims: Record<string, unknown> | undefined;
    try {
      const [, payloadSegment] = token.split('.');
      claims = JSON.parse(Buffer.from(payloadSegment!, 'base64url').toString());
    } catch {
      // not a decodable JWT
    }
    serverLogger.warn('Bearer token verification failed', {
      route,
      tokenIssuer: claims?.iss,
      tokenAuthorizedParty: claims?.azp,
      tokenKey: claims ? undefined : 'undecodable',
      ...toErrorDetails(error),
    });
    return {};
  }
}
