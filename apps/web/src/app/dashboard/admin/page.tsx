'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send, Users, Mail, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    totalUsers: number;
  } | null>(null);

  const handleSendReEngagement = async () => {
    if (!confirm('Send re-engagement emails to all users? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/re-engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 100 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send campaign');
      }

      setResult({
        sent: data.sent,
        failed: data.failed,
        totalUsers: data.totalUsers,
      });

      toast.success(`Campaign complete: ${data.sent} sent, ${data.failed} failed`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Campaign failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin</h1>
        <p className="text-muted-foreground">Manage campaigns and user outreach</p>
      </div>

      <div className="grid gap-6">
        {/* Re-engagement Campaign */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#c23326]" />
              Re-engagement Campaign
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Send the "We are back and better than ever" email to all users. 
              This is for users who signed up when the app was in a broken state.
            </p>

            {result && (
              <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-[#888888]" />
                  <span className="text-[#efefef]">Total users: {result.totalUsers}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Sent: {result.sent}</span>
                </div>
                {result.failed > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Failed: {result.failed}</span>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleSendReEngagement}
              disabled={loading}
              className="w-full bg-[#c23326] hover:bg-[#d43d2f] text-white font-bold"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Re-engagement Emails
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}