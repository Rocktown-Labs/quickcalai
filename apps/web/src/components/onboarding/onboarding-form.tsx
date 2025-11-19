'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Phone, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

async function completeOnboarding(data: { email: string; phone: string; accountType: string }) {
  const response = await fetch('/api/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to complete onboarding');
  }

  return response.json();
}

interface OnboardingFormProps {
  user: any;
}

export default function OnboardingForm({ user }: OnboardingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    phone: '',
    accountType: '',
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.phone || !formData.accountType) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await completeOnboarding(formData);

      toast.success('Welcome to QuickCal AI!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Complete Your Profile</span>
        </CardTitle>
        <CardDescription>
          We need a few more details to personalize your experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Address</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Phone Number</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <select
              id="accountType"
              value={formData.accountType}
              onChange={(e) => handleInputChange('accountType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose your plan</option>
              <option value="free">Free Plan - Basic features</option>
              <option value="pro">Pro Plan - Advanced features</option>
              <option value="enterprise">Enterprise - Full access</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up your account...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}