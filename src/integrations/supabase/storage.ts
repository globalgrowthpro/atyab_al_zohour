import { supabase } from "./client";

export type StorageBucket = "product-images" | "ticket-attachments" | "payment-receipts" | "store-assets";

export interface UploadOptions {
  upsert?: boolean;
  contentType?: string;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
  error: Error | null;
}

/**
 * Upload a file or blob to Supabase Storage with graceful fallback for offline/preview mode.
 */
export async function uploadToStorage(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
  options: UploadOptions = { upsert: true }
): Promise<UploadResult> {
  const cleanPath = path.replace(/^\/+/, "");

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(cleanPath, file, {
      upsert: options.upsert ?? true,
      contentType: options.contentType || file.type || "application/octet-stream",
    });

    if (error) {
      // In offline/demo mode, return a client-side Object URL
      const fallbackUrl = typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(file)
        : "";
      return {
        path: cleanPath,
        publicUrl: fallbackUrl,
        error: new Error(error.message),
      };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
      error: null,
    };
  } catch (err: any) {
    const fallbackUrl = typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
      ? URL.createObjectURL(file)
      : "";
    return {
      path: cleanPath,
      publicUrl: fallbackUrl,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Get public URL for a stored asset in a Supabase bucket.
 */
export function getStoragePublicUrl(bucket: StorageBucket, path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+/, "");
  const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFromStorage(bucket: StorageBucket, path: string): Promise<boolean> {
  try {
    const cleanPath = path.replace(/^\/+/, "");
    const { error } = await supabase.storage.from(bucket).remove([cleanPath]);
    return !error;
  } catch {
    return false;
  }
}

