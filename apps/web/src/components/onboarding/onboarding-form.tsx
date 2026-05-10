'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Phone, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { completeOnboarding } from '@/app/onboarding/_actions';
import { PricingTable } from '@clerk/nextjs';
import posthog from 'posthog-js';

interface OnboardingFormProps {
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  };
}

export default function OnboardingForm({ user }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: '',
  });

  const router = useRouter();
  const { user: clerkUser } = useUser();
  const totalSteps = 2;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      return formData.email.trim() && formData.phone.trim();
    }
    // Step 2 (PricingTable) doesn't need validation - user selects plan there
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    const submitData = new FormData();
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    // Note: accountType will be determined by Clerk billing after subscription
    submitData.append('accountType', 'pending'); // Will be updated when subscription completes

    const res = await completeOnboarding(submitData);

    if (res?.message) {
      // Reload the user's data from Clerk to get updated metadata
      await clerkUser?.reload();
      posthog.identify(user.id, {
        email: formData.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
      });
      posthog.capture('onboarding_completed', {
        has_phone: !!formData.phone,
      });
      toast.success('Welcome to QuickCal AI! Complete your subscription to unlock premium features.');
      router.push('/dashboard');
    }

    if (res?.error) {
      setError(res.error);
      toast.error(res.error);
    }

    setIsLoading(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
              <p className="text-muted-foreground">We need your contact details for account setup</p>
            </div>

            <div className="space-y-4">
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
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground">Select a subscription plan to unlock premium features</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <PricingTable
                appearance={{
                  theme: undefined,
                  variables: {
                    colorPrimary: '#3b82f6',
                  },
                }}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>You can change your plan anytime from your account settings.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Complete Your Profile</span>
        </CardTitle>
        <CardDescription>
          Step {currentStep} of {totalSteps}: {currentStep === 1 ? 'Contact Information' : 'Select Subscription'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {renderStepContent()}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <div className="flex-1" />

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i + 1 <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}