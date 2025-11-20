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

      // First try to check Clerk directly (fastest)
      const hasPremiumPlan = has ? has({ plan: 'premium_user' }) : false;
      const hasPremiumFeature = has ? has({ feature: 'premium' }) : false;
      const hasFileSharing = has ? has({ feature: 'file_sharing' }) : false;

      // User is premium if they have the premium plan OR premium features
      const clerkPremiumStatus = hasPremiumPlan || hasPremiumFeature || hasFileSharing;

      // If Clerk says they're premium, trust it immediately
      if (clerkPremiumStatus) {
        logger.log('Premium status (Clerk):', {
          hasPremiumPlan,
          hasPremiumFeature,
          hasFileSharing,
          finalStatus: true
        });
        setIsPremium(true);
        setIsLoading(false);
        return;
      }

      // If Clerk says they're not premium, double-check by forcing token refresh
      // This handles cases where Clerk's cache is stale
      await getToken({ skipCache: true });
      const refreshedHasPremiumPlan = has ? has({ plan: 'premium_user' }) : false;
      const refreshedHasPremiumFeature = has ? has({ feature: 'premium' }) : false;
      const refreshedHasFileSharing = has ? has({ feature: 'file_sharing' }) : false;

      const refreshedPremiumStatus = refreshedHasPremiumPlan || refreshedHasPremiumFeature || refreshedHasFileSharing;

      logger.log('Premium status check (refreshed Clerk):', {
        hasPremiumPlan: refreshedHasPremiumPlan,
        hasPremiumFeature: refreshedHasPremiumFeature,
        hasFileSharing: refreshedHasFileSharing,
        finalStatus: refreshedPremiumStatus
      });

      // If Clerk still says not premium after refresh, check our database as fallback
      if (!refreshedPremiumStatus) {
        try {
          logger.log('Checking database for premium status...');
          const response = await fetch('/api/user/premium-status');
          if (response.ok) {
            const { isPremium: dbPremium } = await response.json();
            logger.log('Premium status (Database):', { finalStatus: dbPremium });
            setIsPremium(dbPremium);
            setIsLoading(false);
            return;
          } else {
            logger.error('Database premium check failed:', response.status);
          }
        } catch (dbError) {
          logger.error('Database premium check error:', dbError);
        }
      }

      setIsPremium(refreshedPremiumStatus);
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