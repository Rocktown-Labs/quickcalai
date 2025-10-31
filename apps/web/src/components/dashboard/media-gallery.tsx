'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { MediaCard } from "./media-card";
import { getUserMedia, deleteMediaFile, deleteMultipleMediaFiles } from "@/app/dashboard/media/actions";
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

export function MediaGallery() {
  const [uploads, setUploads] = useState<UploadWithEvents[]>([]);
  const [selectedUploads, setSelectedUploads] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    try {
      setLoading(true);
      const uploadsWithEvents = await getUserMedia();
      setUploads(uploadsWithEvents);
    } catch (error) {
      console.error('Failed to load uploads:', error);
      toast.error('Failed to load media files');
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

  const handleDeleteSelected = async () => {
    if (selectedUploads.size === 0) return;

    try {
      await deleteMultipleMediaFiles(Array.from(selectedUploads));
      setUploads(prev => prev.filter(upload => !selectedUploads.has(upload.id)));
      setSelectedUploads(new Set());
      toast.success(`Deleted ${selectedUploads.size} file${selectedUploads.size > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to delete uploads:', error);
      toast.error('Failed to delete files');
    }
  };

  const handleDeleteUpload = async (uploadId: string) => {
    try {
      await deleteMediaFile(uploadId);
      setUploads(prev => prev.filter(upload => upload.id !== uploadId));
      setSelectedUploads(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(uploadId);
        return newSelected;
      });
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete upload:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDownload = (upload: Upload) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = upload.storageUrl;
    link.download = upload.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Media Gallery</h1>
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
        <h1 className="text-2xl font-bold">Media Gallery</h1>
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
            {selectedUploads.size > 0 && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedUploads.size})
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {uploads.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No media files yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload images with dates and times to extract calendar events automatically.
              </p>
            </div>
            <Button asChild size="lg">
              <a href="/dashboard">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Get Started with AI Extraction
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((upload) => (
            <MediaCard
              key={upload.id}
              upload={upload}
              events={upload.events}
              isSelected={selectedUploads.has(upload.id)}
              onSelect={(selected) => handleSelectUpload(upload.id, selected)}
              onDelete={() => handleDeleteUpload(upload.id)}
              onDownload={() => handleDownload(upload)}
            />
          ))}
        </div>
      )}
    </div>
  );
}