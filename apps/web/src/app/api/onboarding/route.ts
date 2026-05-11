import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from '@quickcalai/db';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess, parseJsonBody } from '@/lib/server/route';
import { onboardingSchema } from '@/lib/validators';

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();
  const context = createRouteContext('/api/onboarding', request, { userId: userId ?? undefined });

  try {
    if (!isAuthenticated || !userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    const { email, phone, accountType } = await parseJsonBody(request, onboardingSchema);

    // Determine premium status based on account type
    const isPremiumUser = accountType === 'premium';

    const client = await clerkClient();

    // Update Clerk user metadata to mark onboarding as complete
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        accountType,
      },
    });

    // Also update our database
    await db.update(users)
      .set({
        email,
        phoneNumber: phone,
        isPremiumUser,
        isOnboarded: true,
      })
      .where(eq(users.id, userId));

    return jsonSuccess(context, { success: true });
  } catch (error) {
    return handleRouteError(error, context, 'Failed to complete onboarding');
  }
}
