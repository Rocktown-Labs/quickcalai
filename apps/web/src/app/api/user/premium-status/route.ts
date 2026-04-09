import { auth } from '@clerk/nextjs/server';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from 'drizzle-orm';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';

export async function GET(request: Request) {
  const { userId } = await auth();
  const context = createRouteContext('/api/user/premium-status', request, { userId: userId ?? undefined });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    // Get user premium status from database
    const dbUser = await db
      .select({ isPremiumUser: users.isPremiumUser })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!dbUser[0]) {
      return jsonError(context, 404, 'User not found');
    }

    const isPremium = dbUser[0].isPremiumUser;

    return jsonSuccess(context, { isPremium });
  } catch (error) {
    return handleRouteError(error, context, 'Internal server error');
  }
}
