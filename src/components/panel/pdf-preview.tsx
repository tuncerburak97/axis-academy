// src/components/panel/pdf-preview.tsx — PDF inline önizleme (üye paneli)
"use client";

interface PdfPreviewProps {
  url: string;
  title: string;
}

export function PdfPreview({ url, title }: PdfPreviewProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
      <iframe
        src={url}
        title={`${title} PDF önizleme`}
        className="h-[min(70vh,520px)] w-full"
      />
    </div>
  );
}
