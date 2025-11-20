'use client';
import { useState, useRef } from "react";
import { Activity } from "react";
import { Upload, FileImage, Zap, CheckCircle, Calendar, PenTool, Crown, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePremium } from "@/hooks/use-premium";

export default function Uploader() {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
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
  const router = useRouter();
  const { isPremium, refreshStatus } = usePremium();

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
         // Revalidate the files page to show new cards
         router.refresh();
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
      console.log('Manual event created successfully:', result);
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
          <div className="flex items-center space-x-4 mb-2">
            <h2 className="font-serif font-bold text-2xl text-foreground">AI Calendar Extraction</h2>
            {isPremium && (
              <div className="flex items-center space-x-2 bg-linear-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-lg">
            Upload an image or PDF with dates and times to extract calendar events instantly
          </p>
        </div>

        <Card className="border-2 border-dashed border-border hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Create Calendar Events</span>
            </CardTitle>
            <CardDescription>
              Choose how you'd like to create your calendar events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'ai'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>AI Upload</span>
                {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'manual'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Manual</span>
              </button>
            </div>

            {/* AI Upload Tab */}
            <Activity mode={activeTab === 'ai' ? 'visible' : 'hidden'}>
              {isPremium ? (
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
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
                  <p className="text-muted-foreground mb-4">
                    Unlock AI-powered calendar extraction with our Premium plan
                  </p>
                  <Link href={'/dashboard/settings'}>
                    <Button>Upgrade to Premium</Button>
                  </Link>
                </div>
              )}
            </Activity>

            {/* Manual Input Tab */}
            <Activity mode={activeTab === 'manual' ? 'visible' : 'hidden'}>
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
                     <Label htmlFor="time">Time (optional - format: HH:MM)</Label>
                     <Input
                       id="time"
                       type="time"
                       value={manualEvent.time}
                       onChange={(e) => {
                         const newTime = e.target.value;
                         console.log('Time changed from', manualEvent.time, 'to:', newTime);
                         setManualEvent(prev => ({ ...prev, time: newTime }));
                       }}
                       step="60"
                       placeholder="Select time"
                     />
                     <p className="text-xs text-muted-foreground">
                       Use the time picker above, or manually enter time in HH:MM format
                     </p>
                     {manualEvent.time && (
                       <p className="text-sm text-primary font-medium">
                         ✓ Selected time: {manualEvent.time}
                       </p>
                     )}
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
            </Activity>
          </CardContent>

          {/* Action Buttons */}
          <Activity mode={activeTab === 'ai' ? 'visible' : 'hidden'}>
            {isPremium && uploadedFile && !processingComplete && (
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

             {isPremium && processingComplete && (
               <div className="mt-6 p-6 bg-muted/50 border border-primary/20 rounded-lg text-center">
                 <div className="flex items-center justify-center space-x-2 text-foreground mb-2">
                   <CheckCircle className="w-6 h-6 text-primary" />
                   <span className="font-semibold text-lg">Processing Complete!</span>
                 </div>
                 <p className="text-muted-foreground mb-4">
                   Successfully extracted {eventCount} calendar events!
                 </p>
                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
                   <Link href="/dashboard/files">
                     <Button variant="outline" className="w-full sm:w-auto">
                       View Extracted Events
                     </Button>
                   </Link>
                   <Button
                     onClick={() => {
                       setProcessingComplete(false);
                       setRunId(null);
                       setEventCount(0);
                     }}
                     variant="outline"
                     className="w-full sm:w-auto"
                   >
                     Process Another File
                   </Button>
                 </div>
               </div>
             )}
          </Activity>

          <Activity mode={activeTab === 'manual' ? 'visible' : 'hidden'}>
            <div className="mt-6">
              <Button
                onClick={handleManualEventSubmit}
                disabled={!manualEvent.title || !manualEvent.date}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Create Calendar Event
              </Button>
              {!isPremium && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Upgrade to Premium for AI-powered document processing
                </p>
              )}
            </div>
          </Activity>
        </Card>
      </div>
    </div>
  );
}
