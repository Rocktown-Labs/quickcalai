'use client';
import { useState, useRef, useEffect } from "react";

import {
  Upload, FileImage, Zap, Calendar, PenTool, Crown, Sparkles,
  Download, Mail, MessageSquare, Share2, Copy, CheckCircle2,
  Loader2, CheckCircle, AlertCircle, RotateCcw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePremium } from "@/hooks/use-premium";
import { logger } from "@/lib/logger";
import { useMutation, useQuery } from "@tanstack/react-query";

const PROCESSING_STEPS = [
  { id: 'analyzing', label: 'Analyzing image', icon: FileImage },
  { id: 'detecting', label: 'Detecting dates & times', icon: Sparkles },
  { id: 'extracting', label: 'Extracting event details', icon: Zap },
  { id: 'formatting', label: 'Formatting calendar data', icon: CheckCircle2 },
];

type WorkflowStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'no_events';

type WorkflowStatusResponse = {
  status: WorkflowStatus;
  result: {
    uploadId: string;
    eventCount: number;
    status: WorkflowStatus;
    icsUrl?: string;
  } | null;
  eventCount: number;
  failureReason: string | null;
  uploadId: string;
};

export default function Uploader() {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [dragActive, setDragActive] = useState(false);
  const [manualEvent, setManualEvent] = useState({ title: '', date: '', time: '', description: '' });
  const [userTimezone, setUserTimezone] = useState<string>('');

  // File & Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing State mapping
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const handledTerminalRunRef = useRef<string | null>(null);

  const { user } = useUser();
  const router = useRouter();
  const { isPremium } = usePremium();

  // Initialize user timezone
  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // TanStack Query Mutation for Upload
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || 'Failed to start processing');
      }

      const data = await response.json();
      return data.runId as string;
    },
    onSuccess: () => {
      handledTerminalRunRef.current = null;
      setActiveStepIndex(0);
    },
    onError: (error) => {
      logger.error('Processing failed', { error, userId: user?.id });
      toast.error(error instanceof Error ? error.message : 'Processing failed.');
    }
  });

  // TanStack Query for Status Polling
  const runId = uploadMutation.data;
  const statusQuery = useQuery({
    queryKey: ['workflowStatus', runId],
    queryFn: async () => {
      const response = await fetch(`/api/workflow/status/${runId}`);
      if (!response.ok) throw new Error('Failed to fetch status');
      return response.json() as Promise<WorkflowStatusResponse>;
    },
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed' || status === 'no_events') {
        return false;
      }
      return 2000;
    },
  });

  // Derived Processing Progress
  useEffect(() => {
    if (runId && statusQuery.data?.status !== 'completed' && statusQuery.data?.status !== 'failed' && statusQuery.data?.status !== 'no_events') {
      const interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
      }, 3000);
      return () => clearInterval(interval);
    } else if (statusQuery.data?.status === 'completed') {
      setActiveStepIndex(PROCESSING_STEPS.length);
    }
  }, [runId, statusQuery.data?.status]);

  useEffect(() => {
    const data = statusQuery.data;
    if (!runId || !data) return;

    const status = data.status;
    if (!['completed', 'no_events', 'failed'].includes(status)) return;
    if (handledTerminalRunRef.current === `${runId}:${status}`) return;

    handledTerminalRunRef.current = `${runId}:${status}`;
    if (status === 'completed') {
      router.refresh();
      toast.success(`Done. Extracted ${data.eventCount || 0} event${data.eventCount === 1 ? '' : 's'}.`);
    } else if (status === 'no_events') {
      router.refresh();
    } else if (status === 'failed') {
      router.refresh();
      toast.error(data.failureReason || 'Workflow failed.');
    }
  }, [router, runId, statusQuery.data]);

  useEffect(() => {
    if (!statusQuery.error) return;

    logger.error('Status check failed', { error: statusQuery.error, runId });
    toast.error(
      `${statusQuery.error instanceof Error ? statusQuery.error.message : 'Status check failed.'} ${runId ? `Reference ID: ${runId.substring(0, 8)}` : ''}`.trim()
    );
  }, [runId, statusQuery.error]);

  const workflowStatus = statusQuery.data?.status;
  const isUploadingOrProcessing = uploadMutation.isPending || (runId && (workflowStatus === 'pending' || workflowStatus === 'processing' || !statusQuery.data));
  const isComplete = statusQuery.data?.status === 'completed';
  const hasNoEvents = statusQuery.data?.status === 'no_events';
  const hasFailed = statusQuery.data?.status === 'failed';
  const eventCount = statusQuery.data?.eventCount || 0;
  const icsUrl = statusQuery.data?.result?.icsUrl;

  // Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setUploadedFile(file);
        uploadMutation.mutate(file);
      } else {
        toast.error('Please upload an image or PDF.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF.');
        e.target.value = '';
        return;
      }

      setUploadedFile(file);
      uploadMutation.mutate(file);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    uploadMutation.reset();
    setActiveStepIndex(0);
    handledTerminalRunRef.current = null;
    router.refresh();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!icsUrl) {
      toast.error('The calendar file is not ready yet.');
      return;
    }

    const link = document.createElement('a');
    link.href = icsUrl;
    link.download = `${uploadedFile?.name.replace(/\.[^/.]+$/, "") || 'calendar-events'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async () => {
    if (!icsUrl) {
      toast.error('The calendar link is not ready yet.');
      return;
    }

    try {
      await navigator.clipboard.writeText(icsUrl);
      toast.success('Calendar link copied.');
    } catch (error) {
      logger.error('Failed to copy calendar link', { error, runId });
      toast.error('Could not copy the calendar link.');
    }
  };

  const handleShare = async () => {
    if (!icsUrl) {
      toast.error('The calendar link is not ready yet.');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QuickCalAI calendar file',
          url: icsUrl,
        });
        return;
      }

      await handleCopyLink();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      logger.error('Failed to share calendar link', { error, runId });
      toast.error('Could not share the calendar link.');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...manualEvent, userId: user?.id, timezone: userTimezone }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || 'Failed to create event');
      }

      const data = await response.json();
      const blob = new Blob([data.icsContent], { type: 'text/calendar; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Event created and ICS file downloaded!');
      setManualEvent({ title: '', date: '', time: '', description: '' });
    } catch (error) {
      logger.error('Manual event creation failed', { error, userId: user?.id });
      toast.error(error instanceof Error ? error.message : 'Failed to create event.');
    }
  };

  // --- RENDERING ---

  // 1. Processing State (Red Banner + Checklist)
  if (isUploadingOrProcessing && uploadedFile) {
    const progressPercentage = Math.min(Math.round(((activeStepIndex + 1) / PROCESSING_STEPS.length) * 100), 99);

    return (
      <div className="flex flex-col font-sans w-full animate-in fade-in zoom-in-95 duration-500">
        <h2 className="text-[#efefef] text-xl font-bold mb-4">AI extracts details instantly</h2>

        {/* File Card */}
        <div className="w-full bg-[#212121] p-4 rounded-xl border border-[#333333] mb-4 flex items-center gap-4 shadow-lg">
          <div className="w-10 h-10 bg-[#c23326] rounded-lg flex items-center justify-center shrink-0">
            <FileImage size={20} color="#efefef" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-sans text-sm font-semibold text-[#efefef] truncate">
              {uploadedFile.name}
            </div>
            <div className="font-sans text-xs text-[#888888]">
              {uploadMutation.isPending ? 'Uploading securely...' : 'Processing with AI...'}
            </div>
          </div>
          <div className="animate-pulse">
            <Loader2 size={20} color="#c23326" className="animate-spin" />
          </div>
        </div>

        {/* AI Processing Banner */}
        <div className="w-full bg-[#c23326] text-[#efefef] p-3 rounded-xl flex items-center justify-center gap-2 mb-4 shadow-[0_4px_20px_rgba(194,51,38,0.3)]">
          <Zap size={16} color="#efefef" className="animate-pulse" />
          <span className="font-sans text-sm font-bold">
            AI Processing in Progress
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-4">
          <div className="flex justify-between mb-1 px-1">
            <span className="font-sans text-xs text-[#888888]">Processing...</span>
            <span className="font-sans text-xs font-semibold text-[#c23326]">{progressPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#333333] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c23326] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="w-full flex flex-col gap-2 mb-4">
          {PROCESSING_STEPS.map((step, index) => {
            const isComplete = index < activeStepIndex;
            const isCurrent = index === activeStepIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isCurrent ? 'bg-[#c23326]/10 border border-[#c23326]/30' : 'border border-transparent'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isComplete ? 'bg-[#22c55e]' : isCurrent ? 'bg-[#c23326]' : 'bg-[#212121]'}`}>
                  {isComplete ? (
                    <CheckCircle2 size={16} color="#efefef" />
                  ) : (
                    <StepIcon size={16} color={isCurrent ? "#efefef" : "#888888"} />
                  )}
                </div>
                <span className={`font-sans text-sm ${isCurrent ? 'font-semibold' : 'font-normal'} ${isComplete || isCurrent ? 'text-[#efefef]' : 'text-[#888888]'}`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <div className="ml-auto">
                    <Loader2 size={16} color="#c23326" className="animate-spin" />
                  </div>
                )}
                {isComplete && (
                  <span className="ml-auto font-sans text-xs font-medium text-[#22c55e]">✓ Complete</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Event Counter */}
        <div className="w-full bg-[#212121] p-6 rounded-xl text-center border border-[#333333] shadow-lg">
          <div className="font-sans text-6xl font-black text-[#c23326] leading-none animate-pulse">
            ...
          </div>
          <div className="font-sans text-sm font-medium text-[#888888] mt-2">
            Events Detected
          </div>
        </div>
      </div>
    );
  }

  if ((hasNoEvents || hasFailed) && uploadedFile) {
    const isNoEvents = hasNoEvents;

    return (
      <div className="flex flex-col font-sans w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-full bg-[#212121] p-6 rounded-2xl border border-[#333333] text-center shadow-lg">
          <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 ${isNoEvents ? 'bg-[#c23326]/15' : 'bg-red-500/15'}`}>
            <AlertCircle size={24} className={isNoEvents ? 'text-[#c23326]' : 'text-red-400'} />
          </div>
          <h2 className="text-[#efefef] text-xl font-bold mb-2">
            {isNoEvents ? 'No calendar events found' : 'Processing failed'}
          </h2>
          <p className="text-[#888888] text-base max-w-md mx-auto mb-6">
            {statusQuery.data?.failureReason || (isNoEvents
              ? 'That file looked valid, but QuickCalAI could not find any dates or times to turn into events.'
              : 'QuickCalAI could not finish processing this upload.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleReset} className="bg-[#c23326] hover:bg-[#d43d2f] text-[#efefef] rounded-xl px-4 py-3 text-sm font-bold">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try another file
            </Button>
            <Button asChild variant="outline" className="border-[#333333] bg-[#161616] text-[#efefef] hover:bg-[#2a2a2a] rounded-xl px-4 py-3 text-sm font-bold">
              <Link href="/dashboard/files">View files</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Completed State (Green Banner + Export Options)
  if (isComplete && uploadedFile) {
    const exportOptions = [
      { icon: Download, label: "Download .ics File", desc: "Import to any calendar app", primary: true, onClick: handleDownload },
      { icon: Copy, label: "Copy Link", desc: "Paste into email or chat", onClick: handleCopyLink },
      { icon: Share2, label: "Share Link", desc: "Use your device share sheet", onClick: handleShare },
    ];

    return (
      <div className="flex flex-col font-sans w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-[#efefef] text-xl font-bold mb-4">Download your .ics and you're done</h2>

        {/* Success Banner */}
        <div className="w-full bg-[#22c55e]/10 p-4 rounded-xl border border-[#22c55e]/30 mb-4 flex items-center gap-4 shadow-lg">
          <div className="w-10 h-10 bg-[#22c55e] rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <CheckCircle size={20} color="#efefef" />
          </div>
          <div>
            <div className="font-sans text-lg font-bold text-[#22c55e]">Processing Complete!</div>
            <div className="font-sans text-base text-[#efefef]">{eventCount} events ready to download</div>
          </div>
        </div>

        {/* Export Options Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
          {exportOptions.map((option, index) => {
            const OptionIcon = option.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={option.onClick}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 text-left group ${option.primary ? 'bg-[#c23326] shadow-[0_10px_25px_rgba(194,51,38,0.3)] hover:bg-[#d43d2f]' : 'bg-[#212121] border border-[#333333] hover:border-[#444444]'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${option.primary ? 'bg-[#efefef]/15 group-hover:bg-[#efefef]/25' : 'bg-[#161616]'}`}>
                  <OptionIcon size={20} color={option.primary ? "#efefef" : "#c23326"} />
                </div>
                <div className="flex-1">
                  <div className="font-sans text-base font-bold text-[#efefef]">{option.label}</div>
                  <div className={`font-sans text-sm ${option.primary ? 'text-[#efefef]/80' : 'text-[#888888]'}`}>{option.desc}</div>
                </div>
              </button>
            );
          })}
          <Link
            href="/dashboard/files"
            className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 text-left group bg-[#212121] border border-[#333333] hover:border-[#444444]"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors bg-[#161616]">
              <Mail size={20} color="#c23326" />
            </div>
            <div className="flex-1">
              <div className="font-sans text-base font-bold text-[#efefef]">Email or SMS</div>
              <div className="font-sans text-sm text-[#888888]">Open file delivery options</div>
            </div>
            <MessageSquare size={18} className="text-[#888888]" />
          </Link>
        </div>

        {/* File Preview Card */}
        <div className="w-full mt-6 bg-[#212121] p-4 rounded-xl border border-[#333333] flex items-center gap-4 shadow-lg">
          <div className="w-10 h-10 bg-[#c23326] rounded-lg flex items-center justify-center shrink-0">
            <Calendar size={20} color="#efefef" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-sans text-base font-semibold text-[#efefef] truncate">{uploadedFile.name.replace(/\.[^/.]+$/, "")}-events.ics</div>
            <div className="font-sans text-sm text-[#888888]">{eventCount} events • Ready to import</div>
          </div>
          <button type="button" onClick={handleCopyLink} className="px-4 py-2 bg-[#161616] rounded-lg border border-[#333333] flex items-center gap-2 hover:bg-[#2a2a2a] transition-all active:scale-95 group shrink-0">
            <Copy size={16} color="#888888" className="group-hover:text-[#efefef] transition-colors" />
            <span className="font-sans text-sm text-[#efefef]">Copy Link</span>
          </button>
        </div>

        <div className="pt-6 text-center w-full">
          <Button variant="link" onClick={handleReset} className="text-[#888888] hover:text-[#efefef] text-sm">
            Upload another file
          </Button>
        </div>
      </div>
    );
  }

  // 3. Initial State (Upload Dropzone / Manual Form)
  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="mb-6 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <h2 className="font-bold text-2xl text-[#efefef]">AI Calendar Extraction</h2>
              {isPremium && (
                <div className="flex items-center space-x-1 bg-linear-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  <Crown className="w-3 h-3" />
                  <span>PREMIUM</span>
                </div>
              )}
            </div>
            <p className="text-[#888888] text-base max-w-md">
              Upload an image or PDF with dates and times to extract calendar events instantly
            </p>
          </div>

          <div className="flex w-fit mx-auto md:mx-0 bg-[#212121] p-1 rounded-xl border border-[#333333]">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'bg-[#c23326] text-[#efefef] shadow-md'
                  : 'text-[#888888] hover:text-[#efefef]'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>AI Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'manual'
                  ? 'bg-[#c23326] text-[#efefef] shadow-md'
                  : 'text-[#888888] hover:text-[#efefef]'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Manual</span>
            </button>
          </div>
        </div>

        <Card className="border-none bg-transparent overflow-visible">
          <CardContent className="p-0">
             {activeTab === 'ai' && (
              <>
              {isPremium ? (
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-500 w-full ${
                    dragActive ? "border-[#c23326] bg-[#c23326]/5 scale-[1.02] shadow-[0_0_30px_rgba(194,51,38,0.1)]" : "border-[#333333] hover:border-[#c23326]/40 bg-[#1a1a1a]"
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
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-[#c23326]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(194,51,38,0.15)]">
                      <Upload className="w-8 h-8 text-[#c23326]" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#efefef]">Drop your document here</p>
                      <p className="text-[#888888] text-base mt-2">or click to browse files</p>
                    </div>
                    <p className="text-sm text-[#888888]/60 font-medium pt-4">Supports JPEG, PNG, WebP, and PDF up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-[#1a1a1a] rounded-2xl border border-[#333333]">
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-[#efefef]">Premium Feature</h3>
                  <p className="text-[#888888] mb-6 text-base">
                    Unlock AI-powered calendar extraction with our Premium plan
                  </p>
                  <Link href={'/dashboard/settings'}>
                    <Button className="bg-[#c23326] hover:bg-[#d43d2f] text-white text-lg px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 font-bold">
                      Upgrade to Premium
                    </Button>
                  </Link>
                </div>
              )}
              </>
            )}

            {activeTab === 'manual' && (
              <div className="bg-[#1a1a1a] rounded-2xl border border-[#333333] p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {userTimezone && (
                  <div className="p-3 bg-[#c23326]/10 border border-[#c23326]/30 rounded-xl flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#c23326]" />
                    <p className="text-sm text-[#efefef]">
                      Events will be created in: <strong className="text-[#c23326]">{userTimezone}</strong>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <Label htmlFor="title" className="text-sm text-[#efefef] font-semibold ml-1">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="Meeting with John"
                      value={manualEvent.title}
                      onChange={(e) => setManualEvent(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-[#212121] border-[#333333] text-[#efefef] h-10 rounded-lg text-base focus:ring-[#c23326] focus:border-[#c23326]"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="date" className="text-sm text-[#efefef] font-semibold ml-1">Date *</Label>
                     <Input
                       id="date"
                       type="date"
                       value={manualEvent.date}
                       onChange={(e) => setManualEvent(prev => ({ ...prev, date: e.target.value }))}
                       className="bg-[#212121] border-[#333333] text-[#efefef] h-10 rounded-lg text-base focus:ring-[#c23326] focus:border-[#c23326] cursor-text"
                     />
                  </div>
                  <div className="col-span-1 space-y-2">
                     <Label htmlFor="time" className="text-sm text-[#efefef] font-semibold ml-1">Time (optional)</Label>
                     <Input
                       id="time"
                       type="time"
                       value={manualEvent.time}
                       onChange={(e) => setManualEvent(prev => ({ ...prev, time: e.target.value }))}
                       step="60"
                       className="bg-[#212121] border-[#333333] text-[#efefef] h-10 rounded-lg text-base focus:ring-[#c23326] focus:border-[#c23326] cursor-text"
                     />
                   </div>
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <Label htmlFor="description" className="text-sm text-[#efefef] font-semibold ml-1">Description</Label>
                    <textarea
                      id="description"
                      placeholder="Event details..."
                      value={manualEvent.description}
                      onChange={(e) => setManualEvent(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#212121] border border-[#333333] text-[#efefef] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c23326] focus:border-[#c23326] resize-none text-base h-24"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleManualEventSubmit}
                  disabled={!manualEvent.title || !manualEvent.date}
                  className="w-full bg-[#c23326] hover:bg-[#d43d2f] text-[#efefef] h-12 rounded-xl text-lg font-bold transition-all shadow-lg disabled:opacity-50"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Create Calendar Event
                </Button>
               </div>
             )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
