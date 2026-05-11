import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from '@quickcalai/db';
import SettingsForm from '@/components/settings/settings-form';
import SubscriptionManager from '@/components/settings/subscription-manager';
import * as Sentry from '@sentry/nextjs';
import { serverLogger } from '@/lib/logger';

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="p-8 text-center">Please sign in to access settings</div>;
  }

  const user = await currentUser();

  if (!user) {
    return <div className="p-8 text-center">Please sign in to access settings</div>;
  }

  let userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses?.[0]?.emailAddress || '',
    phone: '',
  };

  let hasError = false;

  try {
    // Get user data from our database
    const dbUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (dbUser[0]) {
      userData = {
        ...userData,
        email: dbUser[0].email || userData.email,
        phone: dbUser[0].phoneNumber || '',
      };
    }
  } catch (error) {
    hasError = true;
    serverLogger.error('Failed to fetch user settings from database', { userId, error });
    Sentry.captureException(error, {
      tags: { section: 'settings' },
      extra: { userId }
    });
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {hasError && (
          <div className="p-4 mb-6 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm">
            We're having trouble connecting to the database. Some settings might be temporarily unavailable, but you can still view your basic profile.
          </div>
        )}

        <SettingsForm user={userData} />

        <SubscriptionManager />
      </div>
    </div>
  );
}
