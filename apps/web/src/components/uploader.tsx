'use client';
import { useState, useRef } from "react";
import { Upload, FileImage, Zap, CheckCircle, Calendar, PenTool } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export default function Uploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [manualEvent, setManualEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { has } = useAuth();
  const isPremium = has ? has({ plan: 'premium_user' }) : false;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setUploadedFile(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!uploadedFile || !user) return;

    setIsProcessing(true);

    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Start the workflow
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { runId: workflowRunId } = await response.json();
      setRunId(workflowRunId);

      // Start polling for workflow completion
      pollWorkflowStatus(workflowRunId);

    } catch (error) {
      console.error('Processing failed:', error);
      setIsProcessing(false);
    }
  };

  const pollWorkflowStatus = async (workflowRunId: string) => {
    try {
      const response = await fetch(`/api/workflow/status/${workflowRunId}`);
      if (!response.ok) {
        throw new Error('Failed to get workflow status');
      }

      const status = await response.json();

      if (status.status === 'completed') {
        setProcessingComplete(true);
        setIsProcessing(false);
        setEventCount(status.eventCount || 0);
        // Reset file
        setUploadedFile(null);
      } else if (status.status === 'failed') {
        throw new Error('Workflow failed');
      } else {
        // Still processing, poll again in 2 seconds
        setTimeout(() => pollWorkflowStatus(workflowRunId), 2000);
      }
    } catch (error) {
      console.error('Status check failed:', error);
      setIsProcessing(false);
    }
  };

  const handleManualEventSubmit = async () => {
    if (!manualEvent.title || !manualEvent.date) {
      toast.error('Please fill in at least title and date');
      return;
    }

    try {
      const response = await fetch('/api/manual-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...manualEvent,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const result = await response.json();
      toast.success('Event created successfully!');
      setManualEvent({ title: '', date: '', time: '', description: '' });
    } catch (error) {
      console.error('Manual event creation failed:', error);
      toast.error('Failed to create event');
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Calendar Extraction Section */}
      <div>
        <div className="mb-6">
          <h2 className="font-serif font-bold text-2xl text-foreground mb-2">AI Calendar Extraction</h2>
          <p className="text-muted-foreground text-lg">
            Upload an image or PDF with dates and times to extract calendar events instantly
          </p>
        </div>

        <Card className="border-2 border-dashed border-border hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isPremium ? (
                <>
                  <Zap className="w-5 h-5" />
                  <span>AI Calendar Extraction</span>
                </>
              ) : (
                <>
                  <PenTool className="w-5 h-5" />
                  <span>Manual Event Creation</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isPremium
                ? "Upload an image or PDF with dates and times to extract calendar events instantly"
                : "Create calendar events manually - upgrade to premium for AI-powered extraction"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPremium ? (
              // AI Upload Form for Premium Users
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {uploadedFile ? (
                  <div className="space-y-4">
                    <FileImage className="w-12 h-12 text-primary mx-auto" />
                    <div>
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button onClick={() => setUploadedFile(null)} variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-foreground">Drop your document here</p>
                      <p className="text-muted-foreground">or click to browse files</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Supports JPEG, PNG, WebP, and PDF up to 10MB</p>
                  </div>
                )}
              </div>
            ) : (
              // Manual Event Creation Form for Free Users
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="Meeting with John"
                      value={manualEvent.title}
                      onChange={(e) => setManualEvent(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={manualEvent.date}
                      onChange={(e) => setManualEvent(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={manualEvent.time}
                      onChange={(e) => setManualEvent(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    placeholder="Event details..."
                    value={manualEvent.description}
                    onChange={(e) => setManualEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </CardContent>

          {isPremium ? (
            // Premium: Show upload processing
            <>
              {uploadedFile && !processingComplete && (
                <div className="mt-6">
                  <Button
                    onClick={handleProcess}
                    disabled={isProcessing || !user}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isProcessing ? (
                     <>
                       <Zap className="w-4 h-4 mr-2 animate-spin" />
                       Processing document with AI...
                     </>
                   ) : (
                     <>
                       <Zap className="w-4 h-4 mr-2" />
                       Extract Calendar Events
                     </>
                   )}
                 </Button>
               </div>
             )}

             {processingComplete && (
               <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                 <div className="flex items-center space-x-2 text-green-800">
                   <CheckCircle className="w-5 h-5" />
                   <span className="font-medium">Processing Complete!</span>
                 </div>
                 <p className="text-green-700 mt-1">
                   Successfully extracted {eventCount} calendar events! Check your dashboard for the results.
                 </p>
                 <Button
                   onClick={() => {
                     setProcessingComplete(false);
                     setRunId(null);
                     setEventCount(0);
                   }}
                   variant="outline"
                   className="mt-3"
                 >
                   Process Another File
                 </Button>
               </div>
             )}
           </>
          ) : (
            // Free: Show manual event creation button
            <div className="mt-6">
              <Button
                onClick={handleManualEventSubmit}
                disabled={!manualEvent.title || !manualEvent.date}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Create Calendar Event
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Upgrade to Premium for AI-powered document processing
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
