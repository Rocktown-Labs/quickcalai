import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileImage,
  FileText,
  Download,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { downloadFile, emailFile, smsFile } from "@/app/dashboard/files/actions";
import { toast } from "sonner";

interface FilesCardProps {
  icsFile: {
    id: string;
    fileName: string;
    originalFileName: string;
    icsUrl: string;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: Date;
    updatedAt: Date;
  };
  events?: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    startTime: Date;
    endTime?: Date;
    isAllDay: boolean;
  }>;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  isPremium: boolean;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    icon: Clock
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: Loader2
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: CheckCircle
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: XCircle
  }
};

export function FilesCard({ icsFile, events = [], isSelected, onSelect, isPremium }: FilesCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isSmsing, setIsSmsing] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showSmsForm, setShowSmsForm] = useState(false);

  const statusInfo = statusConfig[icsFile.status];
  const StatusIcon = statusInfo.icon;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create a temporary link to download the ICS file
      const link = document.createElement('a');
      link.href = icsFile.icsUrl;
      link.download = icsFile.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('ICS file downloaded successfully');
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsEmailing(true);
    try {
      const result = await emailFile(icsFile.id, email);
      toast.success(result.message);
      setShowEmailForm(false);
      setEmail("");
    } catch (error) {
      console.error('Failed to email file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsEmailing(false);
    }
  };

  const handleSms = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsSmsing(true);
    try {
      const result = await smsFile(icsFile.id, phoneNumber);
      toast.success(result.message);
      setShowSmsForm(false);
      setPhoneNumber("");
    } catch (error) {
      console.error('Failed to send SMS:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send SMS');
    } finally {
      setIsSmsing(false);
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <h3 className="font-medium text-sm truncate max-w-[200px]" title={icsFile.fileName}>
                  {icsFile.fileName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  From: {icsFile.originalFileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(icsFile.createdAt, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className={statusInfo.color}>
            <StatusIcon className={`w-3 h-3 mr-1 ${icsFile.status === 'processing' ? 'animate-spin' : ''}`} />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {events.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Extracted Events ({events.length})
            </h4>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="text-xs p-2 bg-muted rounded">
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-muted-foreground flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {format(event.startTime, 'MMM d, h:mm a')}
                    {event.location && (
                      <>
                        <MapPin className="w-3 h-3 ml-2 mr-1" />
                        {event.location}
                      </>
                    )}
                  </div>
                </div>
              ))}
              {events.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{events.length - 3} more events
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Download Button - Available to all users */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download
          </Button>

          {/* Premium Features */}
          {isPremium ? (
            <div className="grid grid-cols-2 gap-2">
              {!showEmailForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmailForm(true)}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
              ) : (
                <div className="col-span-2 space-y-2">
                  <div>
                    <Label htmlFor={`email-${icsFile.id}`} className="text-xs">Email Address</Label>
                     <Input
                       id={`email-${icsFile.id}`}
                       type="email"
                       placeholder="user@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="h-8 text-xs"
                     />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleEmail}
                      disabled={isEmailing}
                      className="flex-1 h-8 text-xs"
                    >
                      {isEmailing ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Mail className="w-3 h-3 mr-1" />
                      )}
                      Send
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowEmailForm(false);
                        setEmail("");
                      }}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!showSmsForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSmsForm(true)}
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  SMS
                </Button>
              ) : (
                <div className="col-span-2 space-y-2">
                  <div>
                    <Label htmlFor={`sms-${icsFile.id}`} className="text-xs">Phone Number</Label>
                     <Input
                       id={`sms-${icsFile.id}`}
                       type="tel"
                       placeholder="+1234567890"
                       value={phoneNumber}
                       onChange={(e) => setPhoneNumber(e.target.value)}
                       className="h-8 text-xs"
                     />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleSms}
                      disabled={isSmsing}
                      className="flex-1 h-8 text-xs"
                    >
                      {isSmsing ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <MessageSquare className="w-3 h-3 mr-1" />
                      )}
                      Send
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowSmsForm(false);
                        setPhoneNumber("");
                      }}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Upgrade to Premium for Email & SMS sharing
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                <a href="/pricing">Upgrade to Premium</a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}