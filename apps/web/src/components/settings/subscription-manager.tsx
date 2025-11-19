'use client';

import { PricingTable } from '@clerk/nextjs';
import { usePremium } from '@/hooks/use-premium';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function SubscriptionManager() {
  const { isPremium, refreshStatus } = usePremium();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStatus();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Subscription</h2>
          <p className="text-muted-foreground">
            View and manage your subscription plan.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">
          Current Status: <span className={`font-medium ${isPremium ? 'text-green-600' : 'text-orange-600'}`}>
            {isPremium ? 'Premium' : 'Free'}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          If you've recently changed your subscription, click "Refresh Status" to update your plan.
        </p>
      </div>

      <PricingTable
        appearance={{
          elements: {
            card: 'shadow-none border border-border',
            button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
          },
        }}
      />
    </div>
  );
}