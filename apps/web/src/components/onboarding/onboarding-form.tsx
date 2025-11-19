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
    accountType: '',
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
    submitData.append('accountType', formData.accountType);

    const res = await completeOnboarding(submitData);

    if (res?.message) {
      // Reload the user's data from Clerk to get updated metadata
      await clerkUser?.reload();
      toast.success('Welcome to QuickCal AI!');
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
              <p className="text-muted-foreground">Select the plan that best fits your needs</p>
            </div>

            <div className="space-y-4">
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

              {/* Plan comparison */}
              <div className="grid gap-4 mt-6">
                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.accountType === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => handleInputChange('accountType', 'free')}>
                  <h3 className="font-semibold">Free Plan</h3>
                  <p className="text-sm text-muted-foreground">Manual event creation, basic features</p>
                  <p className="text-lg font-bold">$0/month</p>
                </div>

                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.accountType === 'pro' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => handleInputChange('accountType', 'pro')}>
                  <h3 className="font-semibold">Pro Plan</h3>
                  <p className="text-sm text-muted-foreground">AI-powered document processing, email sharing</p>
                  <p className="text-lg font-bold">$9.99/month</p>
                </div>

                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.accountType === 'enterprise' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => handleInputChange('accountType', 'enterprise')}>
                  <h3 className="font-semibold">Enterprise Plan</h3>
                  <p className="text-sm text-muted-foreground">Full access, SMS sharing, priority support</p>
                  <p className="text-lg font-bold">$29.99/month</p>
                </div>
              </div>
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
          Step {currentStep} of {totalSteps}: {currentStep === 1 ? 'Contact Information' : 'Choose Your Plan'}
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