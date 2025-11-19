import { auth, currentUser } from '@clerk/nextjs/server';
import SettingsForm from '@/components/settings/settings-form';

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to access settings</div>;
  }

  const user = await currentUser();

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <SettingsForm user={user} />
      </div>
    </div>
  );
}