// src/lib/materials.ts — sınıf materyali dosya doğrulama ve yardımcıları
export const MAX_MATERIAL_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".zip",
  ".md",
  ".txt",
]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "text/markdown",
  "text/plain",
  "application/octet-stream",
]);

export type MaterialFileErrorCode = "file_too_large" | "invalid_type" | "upload_failed" | "bucket_missing";

export function materialAdminPath(classId: string, error?: string, saved?: boolean): string {
  const params = new URLSearchParams();
  params.set("tab", "materials");
  if (saved) params.set("saved", "1");
  if (error) params.set("error", error);
  const query = params.toString();
  return `/admin/siniflar/${classId}?${query}`;
}

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

export { isPdfPath } from "@/lib/file-preview";

export function validateMaterialFile(file: File): { ok: true } | { ok: false; code: MaterialFileErrorCode } {
  if (file.size > MAX_MATERIAL_FILE_SIZE) {
    return { ok: false, code: "file_too_large" };
  }
  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { ok: false, code: "invalid_type" };
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return { ok: false, code: "invalid_type" };
  }
  return { ok: true };
}

export function buildMaterialStoragePath(classId: string, filename: string): string {
  const safeName = filename.replace(/[^\w.\-() ]+/g, "_");
  return `${classId}/${crypto.randomUUID()}-${safeName}`;
}

export function mapUploadError(message: string): MaterialFileErrorCode {
  const lower = message.toLowerCase();
  if (lower.includes("bucket") || lower.includes("not found")) return "bucket_missing";
  return "upload_failed";
}
