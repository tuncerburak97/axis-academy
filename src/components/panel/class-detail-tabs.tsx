// src/components/panel/class-detail-tabs.tsx — öğrenci sınıf detay: 4 tab wow UX
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Download, FileText } from "lucide-react";
import { ClassProgressHero } from "@/components/panel/class-progress-hero";
import { WeekProgressTracker } from "@/components/panel/week-progress-tracker";
import { PdfPreview } from "@/components/panel/pdf-preview";
import {
  aggregateMaterialStats,
  buildClassProgress,
  type ClassProgressSnapshot,
} from "@/lib/syllabus";
import { isPdfPath } from "@/lib/materials";
import type { ClassMaterial, SyllabusWeek } from "@/lib/types/catalog";
import type { MaterialWithUrl } from "@/components/panel/class-materials-tabs";

type ClassTab = "progress" | "syllabus" | "lessons" | "homework";

interface ClassDetailTabsProps {
  startDate: string;
  durationWeeks: number;
  currentWeekOverride: number | null;
  syllabus: SyllabusWeek[];
  materials: MaterialWithUrl[];
}

const tabLabels: Record<ClassTab, string> = {
  progress: "İlerleme",
  syllabus: "Müfredat",
  lessons: "Dersler",
  homework: "Ödevler",
};

export function ClassDetailTabs({
  startDate,
  durationWeeks,
  currentWeekOverride,
  syllabus,
  materials,
}: ClassDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<ClassTab>("progress");

  const progress = buildClassProgress(startDate, durationWeeks, currentWeekOverride);
  const stats = aggregateMaterialStats(materials);
  const currentWeekTitle = syllabus.find((w) => w.week_number === progress.effectiveWeek)?.title;

  const lessons = materials
    .filter((m) => m.category === "weekly")
    .sort((a, b) => (a.week_number ?? 0) - (b.week_number ?? 0) || a.sort_order - b.sort_order);

  const homework = materials
    .filter((m) => m.category === "homework")
    .sort((a, b) => (a.week_number ?? 0) - (b.week_number ?? 0) || a.sort_order - b.sort_order);

  const tabs: { id: ClassTab; count?: number }[] = [
    { id: "progress" },
    { id: "syllabus", count: syllabus.length },
    { id: "lessons", count: lessons.length },
    { id: "homework", count: homework.length },
  ];

  return (
    <div>
      <ClassProgressHero progress={progress} currentWeekTitle={currentWeekTitle} stats={stats} />

      <div role="tablist" aria-label="Eğitim içeriği sekmeleri" className="scroll-fade-x mt-8 border-b border-line">
        <div className="flex gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-11 shrink-0 snap-start whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 sm:py-3 ${
                  isActive ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {tabLabels[tab.id]}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1.5 rounded-full bg-surface px-2 py-0.5 text-xs">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="mt-6">
        {activeTab === "progress" && (
          <ProgressOverview progress={progress} syllabus={syllabus} materials={materials} />
        )}
        {activeTab === "syllabus" && (
          <WeekProgressTracker
            weeks={syllabus}
            effectiveWeek={progress.effectiveWeek}
            materials={materials}
          />
        )}
        {activeTab === "lessons" && (
          <MaterialList
            items={lessons}
            emptyMessage="Henüz haftalık ders materyali yüklenmedi."
          />
        )}
        {activeTab === "homework" && (
          <MaterialList
            items={homework}
            emptyMessage="Henüz ödev verilmedi. Yeni ödevler burada görünecek."
          />
        )}
      </div>
    </div>
  );
}

function ProgressOverview({
  progress,
  syllabus,
  materials,
}: {
  progress: ClassProgressSnapshot;
  syllabus: SyllabusWeek[];
  materials: ClassMaterial[];
}) {
  const upcoming = syllabus.filter((w) => w.week_number > progress.effectiveWeek).slice(0, 2);
  const recentCompleted = syllabus.filter((w) => w.week_number < progress.effectiveWeek).slice(-2);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold">Bu hafta odak</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Hafta {progress.effectiveWeek} içeriğine odaklan — materyalleri ve ödevleri kontrol et.
        </p>
        <div className="mt-5">
          <WeekProgressTracker
            compact
            weeks={syllabus.filter((w) => w.week_number === progress.effectiveWeek)}
            effectiveWeek={progress.effectiveWeek}
            materials={materials}
          />
        </div>
      </section>
      <div className="space-y-4">
        {recentCompleted.length > 0 && (
          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-success">Tamamlanan son haftalar</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-soft">
              {recentCompleted.map((w) => (
                <li key={w.id}>Hafta {w.week_number}: {w.title}</li>
              ))}
            </ul>
          </section>
        )}
        {upcoming.length > 0 && (
          <section className="rounded-xl border border-dashed border-line bg-surface p-5">
            <h3 className="text-sm font-semibold">Sırada</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-soft">
              {upcoming.map((w) => (
                <li key={w.id}>Hafta {w.week_number}: {w.title}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function MaterialList({
  items,
  emptyMessage,
}: {
  items: MaterialWithUrl[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-soft">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((material) => (
        <article key={material.id} className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <FileText className="size-5 text-accent" aria-hidden />
            <h3 className="font-display text-lg font-semibold">{material.title}</h3>
            {material.week_number && (
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                Hafta {material.week_number}
              </span>
            )}
          </div>
          {material.content_md && (
            <div className="prose-custom mt-4">
              <ReactMarkdown>{material.content_md}</ReactMarkdown>
            </div>
          )}
          {material.signedUrl && (
            <div className="mt-4 space-y-3">
              <a
                href={material.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent hover:text-white"
              >
                <Download className="size-4" aria-hidden /> İndir
              </a>
              {material.file_path && isPdfPath(material.file_path) && (
                <PdfPreview url={material.signedUrl} title={material.title} />
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
