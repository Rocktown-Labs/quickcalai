'use client';
import { useState, useRef } from "react";
import { Upload, FileImage, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUploadFile } from "better-upload/client";

export default function Uploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { control } = useUploadFile({ route: 'calendar' });

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
      if (file.type.startsWith('image/')) {
        setUploadedFile(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleProcess = () => {
    if (uploadedFile) {
      setIsProcessing(true);
      control.upload(uploadedFile);
      // Add your processing logic here
      // This would typically trigger the AI processing
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Calendar Extraction Section */}
      <div>
        <div className="mb-6">
          <h2 className="font-serif font-bold text-2xl text-foreground mb-2">AI Calendar Extraction</h2>
          <p className="text-muted-foreground text-lg">
            Upload an image with dates and times to extract calendar events instantly
          </p>
        </div>

        <Card className="border-2 border-dashed border-border hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Image</span>
            </CardTitle>
            <CardDescription>Drag and drop or click to select an image with dates and times</CardDescription>
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
                accept="image/*"
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
                  <p className="text-sm text-muted-foreground">Supports JPEG, PNG, WebP up to 10MB</p>
                </div>
              )}
            </div>

            {uploadedFile && (
              <div className="mt-6">
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || control.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isProcessing || control.isPending ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Processing with AI...
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
