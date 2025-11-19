import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export function usePremium() {
  const { has, getToken } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPremiumStatus = async () => {
    try {
      setIsLoading(true);
      // Force refresh token to get latest session data
      await getToken({ skipCache: true });
      const premiumStatus = has ? has({ plan: 'premium_user' }) : false;
      setIsPremium(premiumStatus);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumStatus();

    // Check on window focus (when user comes back to tab)
    const handleFocus = () => checkPremiumStatus();
    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, [has, getToken]);

  return { isPremium, isLoading, refreshStatus: checkPremiumStatus };
}