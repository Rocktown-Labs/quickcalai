import { auth, currentUser } from '@clerk/nextjs/server';
import OnboardingForm from '@/components/onboarding/onboarding-form';

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to continue</div>;
  }

  const user = await currentUser();

  // Check if user is already onboarded
  // For now, we'll assume they need onboarding if they reach this page
  // In a real app, you'd check a database field

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to QuickCal AI! 🎉
          </h1>
          <p className="text-gray-600">
            Let's set up your account to get started with AI-powered calendar extraction.
          </p>
        </div>

        <OnboardingForm user={user} />
      </div>
    </div>
  );
}