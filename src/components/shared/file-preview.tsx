// src/components/shared/file-preview.tsx — PDF + Office inline önizleme (admin + panel)
"use client";

import { useState } from "react";
import { buildPreviewSrc, getPreviewMode, supportsPreview } from "@/lib/file-preview";

interface FilePreviewProps {
  url: string;
  title: string;
  filePath: string;
  /** Admin materyal listesi gibi sıkışık alanlar için daha kısa yükseklik */
  compact?: boolean;
}

export function FilePreview({ url, title, filePath, compact = false }: FilePreviewProps) {
  const [failed, setFailed] = useState(false);

  if (!supportsPreview(filePath)) return null;

  const mode = getPreviewMode(filePath);
  const src = buildPreviewSrc(filePath, url);
  if (!src) return null;

  const heightClass = compact ? "h-48 sm:h-64" : "h-[min(70vh,520px)]";

  if (failed) {
    return (
      <p className="mt-3 rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-sm text-ink-soft">
        Önizleme açılamadı. Dosyayı indirerek açabilirsin.
      </p>
    );
  }

  return (
    <div className="mt-3 w-full overflow-hidden rounded-xl border border-line bg-surface">
      {mode === "office" && (
        <p className="border-b border-line px-3 py-2 text-xs text-ink-soft">
          Office önizlemesi harici bir görüntüleyici ile sunulur; açılmazsa dosyayı indir.
        </p>
      )}
      <iframe
        src={src}
        title={`${title} önizleme`}
        className={`w-full ${heightClass}`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
