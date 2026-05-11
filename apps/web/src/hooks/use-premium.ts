import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { logger } from '@/lib/logger';

export function usePremium() {
  const { has, getToken } = useAuth();
  const { user } = useUser();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkDatabasePremiumStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/premium-status', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        logger.warn('Premium status API returned non-OK', { status: response.status });
        return false;
      }

      const data = await response.json();
      return data.isPremium === true;
    } catch (error) {
      logger.error('Error fetching database premium status', { error });
      return false;
    }
  };

  const checkPremiumStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check Clerk's billing status directly (fast, client-side)
      const hasPremiumPlan = has ? has({ plan: 'premium_user' }) : false;
      const hasPremiumFeature = has ? has({ feature: 'premium' }) : false;
      const hasFileSharing = has ? has({ feature: 'file_sharing' }) : false;

      const clerkPremiumStatus = hasPremiumPlan || hasPremiumFeature || hasFileSharing;

      logger.log('Premium status check (Clerk):', {
        hasPremiumPlan,
        hasPremiumFeature,
        hasFileSharing,
        hasAvailable: !!has,
        userId: user?.id,
        clerkStatus: clerkPremiumStatus,
      });

      // ALWAYS check the database as the source of truth
      // Webhooks write subscription status here, and Clerk's has()
      // may not reflect billing state if feature entitlements aren't configured
      const dbPremiumStatus = await checkDatabasePremiumStatus();

      logger.log('Premium status check (Database):', {
        dbStatus: dbPremiumStatus,
        userId: user?.id,
      });

      // User is premium if Clerk OR the database says so
      const finalStatus = clerkPremiumStatus || dbPremiumStatus;

      logger.log('Premium status check (Final):', {
        clerkStatus: clerkPremiumStatus,
        dbStatus: dbPremiumStatus,
        finalStatus,
        userId: user?.id,
      });

      setIsPremium(finalStatus);
    } catch (error) {
      logger.error('Error checking premium status', { error });
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, [has, user?.id]);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    } else {
      setIsLoading(false);
      setIsPremium(false);
    }

    // Check on window focus (when user comes back to tab)
    const handleFocus = () => {
      if (user) {
        checkPremiumStatus();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, [user, checkPremiumStatus]);

  return { isPremium, isLoading, refreshStatus: checkPremiumStatus };
}
