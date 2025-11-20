'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export const completeOnboarding = async (formData: FormData) => {
  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated || !userId) {
    return { error: 'No Logged In User' }
  }

  const client = await clerkClient()

  try {
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const accountType = formData.get('accountType') as string

    if (!email || !phone) {
      return { error: 'Email and phone are required' }
    }

    // Determine premium status based on account type
    const isPremiumUser = accountType === 'premium';

    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        accountType,
      },
    })

    // Also update our database
    const { db } = await import('@quickcalai/db')
    const { users } = await import('@quickcalai/db/schema')
    const { eq } = await import('drizzle-orm')

    await db.update(users)
      .set({
        email,
        phoneNumber: phone,
        isPremiumUser,
        isOnboarded: true,
      })
      .where(eq(users.id, userId))

    revalidatePath('/dashboard')
    return { message: 'Onboarding completed successfully' }
  } catch (err) {
    console.error('Onboarding error:', err)
    return { error: 'There was an error completing onboarding.' }
  }
}