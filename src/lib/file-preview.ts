// src/lib/file-preview.ts — dosya önizleme format algılama ve viewer URL üretimi
export type PreviewMode = "pdf" | "office" | "none";

const OFFICE_EXTENSIONS = new Set([".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"]);

export function getFileExtension(filePath: string): string {
  const dot = filePath.lastIndexOf(".");
  return dot >= 0 ? filePath.slice(dot).toLowerCase() : "";
}

export function getPreviewMode(filePath: string): PreviewMode {
  const ext = getFileExtension(filePath);
  if (ext === ".pdf") return "pdf";
  if (OFFICE_EXTENSIONS.has(ext)) return "office";
  return "none";
}

export function supportsPreview(filePath: string): boolean {
  return getPreviewMode(filePath) !== "none";
}

/** @deprecated Prefer getPreviewMode() */
export function isPdfPath(filePath: string): boolean {
  return getPreviewMode(filePath) === "pdf";
}

export function buildOfficeViewerUrl(signedUrl: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrl)}`;
}

export function buildPreviewSrc(filePath: string, signedUrl: string): string | null {
  const mode = getPreviewMode(filePath);
  if (mode === "pdf") return signedUrl;
  if (mode === "office") return buildOfficeViewerUrl(signedUrl);
  return null;
}
