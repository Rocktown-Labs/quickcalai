'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown } from "lucide-react";
import { FilesCard } from "./files-card";
import { getUserFiles, checkPremiumStatus } from "@/app/dashboard/files/actions";
import { toast } from "sonner";

interface Upload {
  id: string;
  fileName: string;
  fileType: string;
  storageUrl: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

interface UploadWithEvents extends Upload {
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    startTime: Date;
    endTime?: Date;
    isAllDay: boolean;
  }>;
}

export function FilesGallery() {
  const [uploads, setUploads] = useState<UploadWithEvents[]>([]);
  const [selectedUploads, setSelectedUploads] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filesData, premiumStatus] = await Promise.all([
        getUserFiles(),
        checkPremiumStatus()
      ]);

      setUploads(filesData);
      setIsPremium(premiumStatus.isPremium);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUpload = (uploadId: string, selected: boolean) => {
    const newSelected = new Set(selectedUploads);
    if (selected) {
      newSelected.add(uploadId);
    } else {
      newSelected.delete(uploadId);
    }
    setSelectedUploads(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUploads(new Set(uploads.map(upload => upload.id)));
    } else {
      setSelectedUploads(new Set());
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Files</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Files</h1>
          {isPremium && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <Crown className="w-4 h-4" />
              <span>Premium</span>
            </div>
          )}
        </div>
        {uploads.length > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedUploads.size === uploads.length && uploads.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({selectedUploads.size} selected)
              </span>
            </div>
          </div>
        )}
      </div>

      {!isPremium && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Unlock Premium Features</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Share your calendar files via Email and SMS with a Premium subscription
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <a href="/pricing">Upgrade Now</a>
            </Button>
          </div>
        </div>
      )}

      {uploads.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No files yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload images with dates and times to extract calendar events and share them via email or SMS.
              </p>
            </div>
            <Button asChild size="lg">
              <a href="/dashboard">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Extracting Events
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((upload) => (
            <FilesCard
              key={upload.id}
              upload={upload}
              events={upload.events}
              isSelected={selectedUploads.has(upload.id)}
              onSelect={(selected) => handleSelectUpload(upload.id, selected)}
              isPremium={isPremium}
            />
          ))}
        </div>
      )}
    </div>
  );
}