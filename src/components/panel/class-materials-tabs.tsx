// src/components/panel/class-materials-tabs.tsx — eğitim materyalleri: kategori tab'ları,
// Markdown render ve imzalı dosya indirme linkleri (client)
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Download, FileText } from "lucide-react";
import { materialCategoryLabels } from "@/lib/types/catalog";
import type { ClassMaterial, MaterialCategory } from "@/lib/types/catalog";

export interface MaterialWithUrl extends ClassMaterial {
  signedUrl: string | null;
}

interface ClassMaterialsTabsProps {
  materials: MaterialWithUrl[];
}

const tabOrder: MaterialCategory[] = ["general", "weekly", "homework", "note"];

export function ClassMaterialsTabs({ materials }: ClassMaterialsTabsProps) {
  const availableTabs = tabOrder.filter((category) =>
    materials.some((material) => material.category === category),
  );
  const [activeTab, setActiveTab] = useState<MaterialCategory>(availableTabs[0] ?? "general");

  if (materials.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-soft">
        Eğitim materyalleri henüz yüklenmedi. Eğitmenin içerik eklediğinde burada görünecek.
      </p>
    );
  }

  const activeMaterials = materials
    .filter((material) => material.category === activeTab)
    .sort((a, b) => (a.week_number ?? 0) - (b.week_number ?? 0) || a.sort_order - b.sort_order);

  return (
    <div>
      {/* Tab başlıkları */}
      <div role="tablist" aria-label="Materyal kategorileri" className="scroll-fade-x border-b border-line">
        <div className="flex gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {availableTabs.map((category) => {
          const isActive = category === activeTab;
          const count = materials.filter((material) => material.category === category).length;
          return (
            <button
              key={category}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(category)}
              className={`min-h-11 shrink-0 snap-start whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                isActive ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {materialCategoryLabels[category]}
              <span className="ml-1.5 rounded-full bg-surface px-2 py-0.5 text-xs">{count}</span>
            </button>
          );
        })}
        </div>
      </div>

      {/* Aktif tab içeriği */}
      <div role="tabpanel" className="mt-6 space-y-5">
        {activeMaterials.map((material) => (
          <article key={material.id} className="rounded-xl border border-line bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <FileText className="size-5 text-accent" aria-hidden />
                {material.title}
              </h3>
              {material.week_number && (
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  Hafta {material.week_number}
                </span>
              )}
            </div>

            {material.content_md && (
              <div className="prose-custom mt-4 [&_table]:block [&_table]:w-full">
                <div className="prose-table-wrap">
                  <ReactMarkdown>{material.content_md}</ReactMarkdown>
                </div>
              </div>
            )}

            {material.signedUrl && (
              <a
                href={material.signedUrl}
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
              >
                <Download className="size-4" aria-hidden /> Dokümanı İndir
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
