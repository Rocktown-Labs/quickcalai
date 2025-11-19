import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // If user has already completed onboarding, redirect to dashboard
  if ((await auth()).sessionClaims?.metadata?.onboardingComplete === true) {
    redirect('/dashboard')
  }

  return <>{children}</>
}