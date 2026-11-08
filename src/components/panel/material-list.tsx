// src/components/panel/material-list.tsx — dönem materyalleri: genel + hafta hafta, kategori rozeti, dosya ve önizleme
import ReactMarkdown from "react-markdown";
import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilePreview } from "@/components/shared/file-preview";
import { supportsPreview } from "@/lib/file-preview";
import { materialCategoryLabels, type MemberMaterial } from "@/lib/queries/member-types";
import { cn } from "@/lib/utils";

const categoryTone = { general: "neutral", weekly: "accent", homework: "amber", note: "info" } as const;

export function MaterialList({ materials, currentWeek }: { materials: MemberMaterial[]; currentWeek?: number }) {
  const groups = new Map<number | null, MemberMaterial[]>();
  for (const material of materials) {
    const key = material.week_number ?? null;
    groups.set(key, [...(groups.get(key) ?? []), material]);
  }
  const ordered = [...groups.entries()].sort(([a], [b]) => (a ?? 0) - (b ?? 0));

  return (
    <div className="flex flex-col gap-6">
      {ordered.map(([week, items]) => (
        <section key={week ?? "genel"} aria-labelledby={`materyal-${week ?? "genel"}`} className="flex flex-col gap-3">
          <h3 id={`materyal-${week ?? "genel"}`} className="flex items-center gap-2 text-sm font-semibold">
            {week === null ? "Genel kaynaklar" : `${week}. hafta`}
            {week !== null && week === currentWeek && (
              <Badge tone="amber" size="sm">
                Bu hafta
              </Badge>
            )}
          </h3>
          <ul className="flex flex-col gap-3">
            {items.map((material) => (
              <li key={material.id} className="rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={categoryTone[material.category] ?? "neutral"} size="sm">
                    {materialCategoryLabels[material.category] ?? material.category}
                  </Badge>
                  <p className="font-semibold">{material.title}</p>
                </div>
                {material.content_md && (
                  <div className="prose-custom mt-2">
                    <ReactMarkdown>{material.content_md}</ReactMarkdown>
                  </div>
                )}
                {material.file_path && (
                  <div className="mt-3">
                    {material.signed_url ? (
                      <a
                        href={material.signed_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border border-line-strong bg-paper px-3 text-sm font-medium hover:bg-surface"
                      >
                        <FileText className="size-4 shrink-0 text-ink-soft" aria-hidden />
                        <span className="truncate">{material.file_name}</span>
                        <Download className="size-4 shrink-0 text-ink-soft" aria-hidden />
                      </a>
                    ) : (
                      <p className="text-sm text-ink-soft">Dosya şu an açılamıyor. Sayfayı yenileyip tekrar dene.</p>
                    )}
                    {material.signed_url && supportsPreview(material.file_path) && (
                      <details className="group mt-2">
                        <summary className={cn("w-fit cursor-pointer text-sm font-semibold text-accent hover:underline")}>Önizle</summary>
                        <FilePreview url={material.signed_url} title={material.title} filePath={material.file_path} />
                      </details>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
