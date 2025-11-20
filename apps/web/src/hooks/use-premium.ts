import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { logger } from '@/lib/logger';

export function usePremium() {
  const { has, getToken } = useAuth();
  const { user } = useUser();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPremiumStatus = async () => {
    try {
      setIsLoading(true);

      // Check Clerk's billing status directly
      const hasPremiumPlan = has ? has({ plan: 'premium_user' }) : false;
      const hasPremiumFeature = has ? has({ feature: 'premium' }) : false;
      const hasFileSharing = has ? has({ feature: 'file_sharing' }) : false;

      // User is premium if they have the premium plan OR premium features
      const clerkPremiumStatus = hasPremiumPlan || hasPremiumFeature || hasFileSharing;

      logger.log('Premium status check:', {
        hasPremiumPlan,
        hasPremiumFeature,
        hasFileSharing,
        hasAvailable: !!has,
        userId: user?.id,
        finalStatus: clerkPremiumStatus
      });

      // If Clerk says not premium, force token refresh and try again
      // This handles cases where Clerk's cache is stale
      if (!clerkPremiumStatus) {
        await getToken({ skipCache: true });
        const refreshedHasPremiumPlan = has ? has({ plan: 'premium_user' }) : false;
        const refreshedHasPremiumFeature = has ? has({ feature: 'premium' }) : false;
        const refreshedHasFileSharing = has ? has({ feature: 'file_sharing' }) : false;

        const refreshedPremiumStatus = refreshedHasPremiumPlan || refreshedHasPremiumFeature || refreshedHasFileSharing;

        logger.log('Premium status check (refreshed):', {
          hasPremiumPlan: refreshedHasPremiumPlan,
          hasPremiumFeature: refreshedHasPremiumFeature,
          hasFileSharing: refreshedHasFileSharing,
          finalStatus: refreshedPremiumStatus
        });

        setIsPremium(refreshedPremiumStatus);
      } else {
        setIsPremium(clerkPremiumStatus);
      }
    } catch (error) {
      logger.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    } else {
      setIsLoading(false);
    }

    // Check on window focus (when user comes back to tab)
    const handleFocus = () => {
      if (user) {
        checkPremiumStatus();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, [has, getToken, user]);

  return { isPremium, isLoading, refreshStatus: checkPremiumStatus };
}