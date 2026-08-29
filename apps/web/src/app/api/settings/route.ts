import { resolveRequestUserId } from '@/lib/server/native-auth';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from '@quickcalai/db';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess, parseJsonBody } from '@/lib/server/route';
import { settingsSchema } from '@/lib/validators';

export async function POST(request: Request) {
  const { userId } = await resolveRequestUserId(request, '/api/settings');
  const context = createRouteContext('/api/settings', request, { userId: userId ?? undefined });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    const { firstName, lastName, email, phone } = await parseJsonBody(request, settingsSchema);

    // Check if the email is already used by another user
    if (email) {
      const existingUser = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser[0] && existingUser[0].id !== userId) {
        return jsonError(context, 400, 'This email address is already in use by another account');
      }
    }

    const name = `${firstName} ${lastName}`.trim();

    const existingAccount = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingAccount[0]) {
      await db.update(users)
        .set({
          email,
          name: name || null,
          phoneNumber: phone || null,
        })
        .where(eq(users.id, userId));
    } else {
      await db.insert(users).values({
        id: userId,
        email,
        name: name || null,
        phoneNumber: phone || null,
        isOnboarded: true,
      });
    }

    return jsonSuccess(context, { success: true });
  } catch (error) {
    return handleRouteError(error, context, 'Failed to update settings');
  }
}
