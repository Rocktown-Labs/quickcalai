"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserUploads, deleteUpload } from "@quickcalai/db";
import { revalidatePath } from "next/cache";
import { serverLogger } from "@/lib/logger";
import { isRecoverableFreshDatabaseError } from "@/lib/server/db-errors";

export async function getUserMedia() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const uploads = await getUserUploads(userId);
    return uploads;
  } catch (error) {
    if (isRecoverableFreshDatabaseError(error)) {
      serverLogger.warn("Media unavailable during schema bootstrap", {
        userId,
        error,
      });
      return [];
    }

    serverLogger.error("Failed to fetch user media", { userId, error });
    throw new Error("Failed to load media files");
  }
}

export async function deleteMediaFile(uploadId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const uploads = await getUserUploads(userId);
    const upload = uploads.find((entry) => entry.id === uploadId);

    if (!upload) {
      throw new Error("File not found");
    }

    await deleteUpload(uploadId);
    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    serverLogger.error("Failed to delete media file", {
      userId,
      uploadId,
      error,
    });
    throw new Error("Failed to delete file");
  }
}

export async function deleteMultipleMediaFiles(uploadIds: string[]) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const uploads = await getUserUploads(userId);
    const ownedUploadIds = new Set(uploads.map((upload) => upload.id));
    const hasForeignUpload = uploadIds.some(
      (uploadId) => !ownedUploadIds.has(uploadId),
    );

    if (hasForeignUpload) {
      throw new Error("One or more files were not found");
    }

    await Promise.all(uploadIds.map((id) => deleteUpload(id)));
    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    serverLogger.error("Failed to delete media files", {
      userId,
      uploadCount: uploadIds.length,
      error,
    });
    throw new Error("Failed to delete files");
  }
}
