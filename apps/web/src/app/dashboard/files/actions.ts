"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserUploads, getUploadEvents, db } from "@quickcalai/db";
import { users } from "@quickcalai/db/schema";
import { eq } from "drizzle-orm";
import { serverLogger } from "@/lib/logger";
import { isRecoverableFreshDatabaseError } from "@/lib/server/db-errors";
import {
  NotificationConfigurationError,
  sendCalendarFileEmail,
  sendCalendarFileSms,
} from "@/lib/server/notifications";

export async function getUserFiles() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const uploads = await getUserUploads(userId);

    // Return uploads that have been processed (completed status) as ICS files with events
    // Exclude manual events since they don't have downloadable ICS files
    const icsFiles = await Promise.all(
      uploads
        .filter(
          (upload): upload is typeof upload & { icsUrl: string } =>
            upload.status === "completed" &&
            upload.fileType !== "manual" &&
            typeof upload.icsUrl === "string" &&
            upload.icsUrl.length > 0,
        )
        .map(async (upload) => {
          const events = await getUploadEvents(upload.id);
          return {
            id: upload.id,
            fileName: `${upload.fileName.replace(/\.[^/.]+$/, "")}.ics`, // Replace extension with .ics
            originalFileName: upload.fileName,
            icsUrl: upload.icsUrl,
            status: upload.status,
            createdAt: upload.createdAt,
            updatedAt: upload.updatedAt,
            events: events.map((event) => ({
              ...event,
              startTime: new Date(event.startTime),
              endTime: event.endTime ? new Date(event.endTime) : undefined,
            })),
          };
        }),
    );

    return icsFiles;
  } catch (error) {
    serverLogger.error("Failed to fetch user files", { userId, error });
    throw new Error("Failed to load files");
  }
}

export async function downloadFile(uploadId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the upload to verify ownership
    const uploads = await getUserUploads(userId);
    const upload = uploads.find((u) => u.id === uploadId);

    if (!upload) {
      throw new Error("File not found");
    }

    // Manual events don't have downloadable ICS files
    if (upload.fileType === "manual") {
      throw new Error("Manual events cannot be downloaded as files");
    }

    // Return the ICS file URL
    const icsUrl = upload.icsUrl;
    const fileName = `${upload.fileName.replace(/\.[^/.]+$/, "")}.ics`;

    if (!icsUrl) {
      throw new Error("File is not ready for download");
    }

    return { storageUrl: icsUrl, fileName };
  } catch (error) {
    serverLogger.error("Failed to get download URL", {
      userId,
      uploadId,
      error,
    });
    throw new Error("Failed to download file");
  }
}

export async function emailFile(uploadId: string, email: string) {
  const { userId, has } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user has premium access
  const hasPremium =
    has({ plan: "premium_user" }) || has({ feature: "file_sharing" });

  if (!hasPremium) {
    throw new Error("Premium feature required");
  }

  try {
    // Get the upload to verify ownership
    const uploads = await getUserUploads(userId);
    const upload = uploads.find((u) => u.id === uploadId);

    if (!upload) {
      throw new Error("File not found");
    }

    // Manual events don't have downloadable ICS files
    if (upload.fileType === "manual") {
      throw new Error("Manual events cannot be emailed as files");
    }

    // Get the ICS file content
    const icsUrl = upload.icsUrl;
    const icsFileName = `${upload.fileName.replace(/\.[^/.]+$/, "")}.ics`;

    if (!icsUrl) {
      throw new Error("File is not ready for sharing");
    }

    try {
      await sendCalendarFileEmail({
        uploadId,
        userId,
        to: email,
        fileName: icsFileName,
        icsUrl,
      });

      return { success: true, message: `ICS file sent to ${email}` };
    } catch (emailError) {
      if (emailError instanceof NotificationConfigurationError) {
        throw new Error(emailError.message);
      }

      serverLogger.error("Email sending failed", {
        userId,
        uploadId,
        email,
        error: emailError,
      });
      throw new Error("Failed to send email");
    }
  } catch (error) {
    serverLogger.error("Failed to email file", {
      userId,
      uploadId,
      email,
      error,
    });
    throw new Error("Failed to send email");
  }
}

export async function smsFile(uploadId: string, phoneNumber: string) {
  const { userId, has } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user has premium access
  const hasPremium =
    has({ plan: "premium_user" }) || has({ feature: "file_sharing" });

  if (!hasPremium) {
    throw new Error("Premium feature required");
  }

  try {
    // Get the upload to verify ownership
    const uploads = await getUserUploads(userId);
    const upload = uploads.find((u) => u.id === uploadId);

    if (!upload) {
      throw new Error("File not found");
    }

    // Manual events don't have downloadable ICS files
    if (upload.fileType === "manual") {
      throw new Error("Manual events cannot be shared via SMS");
    }

    // Send SMS with download link
    const icsUrl = upload.icsUrl;

    if (!icsUrl) {
      throw new Error("File is not ready for sharing");
    }

    try {
      await sendCalendarFileSms({
        uploadId,
        userId,
        to: phoneNumber,
        icsUrl,
      });

      return { success: true, message: `Download link sent to ${phoneNumber}` };
    } catch (smsError) {
      if (smsError instanceof NotificationConfigurationError) {
        throw new Error(smsError.message);
      }

      serverLogger.error("SMS sending failed", {
        userId,
        uploadId,
        phoneNumber,
        error: smsError,
      });
      throw new Error("Failed to send SMS");
    }
  } catch (error) {
    serverLogger.error("Failed to send SMS", {
      userId,
      uploadId,
      phoneNumber,
      error,
    });
    throw new Error("Failed to send SMS");
  }
}

export async function checkPremiumStatus() {
  const { has } = await auth();

  const hasPremium =
    has({ plan: "premium_user" }) || has({ feature: "file_sharing" });

  return { isPremium: hasPremium };
}

export async function getUserContactInfo() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db
      .select({
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      email: user[0]?.email || "",
      phoneNumber: user[0]?.phoneNumber || "",
    };
  } catch (error) {
    if (isRecoverableFreshDatabaseError(error)) {
      serverLogger.warn("Contact info unavailable during schema bootstrap", {
        userId,
        error,
      });
      return {
        email: "",
        phoneNumber: "",
      };
    }

    serverLogger.error("Failed to fetch user contact info", { userId, error });
    throw new Error("Failed to load contact information");
  }
}
