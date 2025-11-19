'use client';
import { useState, useRef } from "react";
import { Upload, FileImage, Zap, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

export default function Uploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

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
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
            </CardTitle>
            <CardDescription>Drag and drop or click to select an image or PDF with dates and times</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <p className="text-lg font-medium text-foreground">Drop your image here</p>
                    <p className="text-muted-foreground">or click to browse files</p>
                  </div>
                   <p className="text-sm text-muted-foreground">Supports JPEG, PNG, WebP, and PDF up to 10MB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
