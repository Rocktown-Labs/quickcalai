import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from 'drizzle-orm';
import SettingsForm from '@/components/settings/settings-form';
import SubscriptionManager from '@/components/settings/subscription-manager';

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to access settings</div>;
  }

  const user = await currentUser();

  if (!user) {
    return <div>Please sign in to access settings</div>;
  }

  // Get user data from our database
  const dbUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  // Extract only serializable user data
  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: dbUser[0]?.email || user.emailAddresses?.[0]?.emailAddress || '',
    phone: dbUser[0]?.phoneNumber || '',
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <SettingsForm user={userData} />

        <SubscriptionManager />
      </div>
    </div>
  );
}
