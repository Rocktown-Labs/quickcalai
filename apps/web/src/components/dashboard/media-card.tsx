import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileImage,
  FileText,
  Download,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface MediaCardProps {
  upload: {
    id: string;
    fileName: string;
    fileType: string;
    storageUrl: string;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: Date;
    updatedAt: Date;
  };
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onDelete: () => void;
  onDownload: () => void;
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

export function MediaCard({ upload, isSelected, onSelect, onDelete, onDownload }: MediaCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const statusInfo = statusConfig[upload.status];
  const StatusIcon = statusInfo.icon;

  const isImage = upload.fileType.startsWith('image/');
  const isPDF = upload.fileType === 'application/pdf';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {isImage ? (
                <FileImage className="w-5 h-5 text-blue-500 flex-shrink-0" />
              ) : isPDF ? (
                <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate" title={upload.fileName}>
                  {upload.fileName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {format(upload.createdAt, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end lg:flex-shrink-0 lg:ml-2">
            <Badge variant="secondary" className={statusInfo.color}>
              <StatusIcon className={`w-3 h-3 mr-1 ${upload.status === 'processing' ? 'animate-spin' : ''}`} />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isImage && (
          <div className="mb-4">
            <img
              src={upload.storageUrl}
              alt={upload.fileName}
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}



        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}