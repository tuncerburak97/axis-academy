// src/components/panel/individual-detail-tabs.tsx — bireysel eğitim detay: progress + müfredat + bilgi
"use client";

import { useState } from "react";
import { Clock, MessageSquare, Package } from "lucide-react";
import { ClassProgressHero } from "@/components/panel/class-progress-hero";
import { WeekProgressTracker } from "@/components/panel/week-progress-tracker";
import { ProgressStepper } from "@/components/panel/progress-stepper";
import { buildIndividualProgress } from "@/lib/syllabus";
import { requestStatusLabels, requestTypeLabels } from "@/lib/types/catalog";
import type { RequestStatus, SyllabusWeek } from "@/lib/types/catalog";

type IndividualTab = "progress" | "syllabus" | "info";

interface IndividualDetailTabsProps {
  status: RequestStatus;
  requestType: "bundle" | "custom" | "schedule";
  moduleTitle: string;
  bundleTitle?: string | null;
  totalHours: number | null;
  calculatedPrice: number;
  progressNote: string;
  userMessage: string | null;
  createdAt: string;
  syllabus: SyllabusWeek[];
}

const requestSteps = ["Talep Alındı", "Planlandı", "Devam Ediyor", "Tamamlandı"];
const requestStepIndex: Record<RequestStatus, number> = {
  received: 0,
  planned: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1,
};

const tabLabels: Record<IndividualTab, string> = {
  progress: "İlerleme",
  syllabus: "Müfredat",
  info: "Talep Bilgisi",
};

export function IndividualDetailTabs({
  status,
  requestType,
  moduleTitle,
  bundleTitle,
  totalHours,
  calculatedPrice,
  progressNote,
  userMessage,
  createdAt,
  syllabus,
}: IndividualDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<IndividualTab>("progress");
  const progress = buildIndividualProgress(status, syllabus.length);
  const currentWeekTitle = syllabus.find((w) => w.week_number === progress.effectiveWeek)?.title;

  const tabs: { id: IndividualTab; count?: number }[] = [
    { id: "progress" },
    { id: "syllabus", count: syllabus.length },
    { id: "info" },
  ];

  return (
    <div>
      <ClassProgressHero
        progress={progress}
        currentWeekTitle={currentWeekTitle}
        footerNote={`Durum: ${requestStatusLabels[status]}`}
      />

      <div className="mt-6 rounded-xl border border-line bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Talep aşaması</p>
        <div className="mt-4 max-w-xl">
          <ProgressStepper steps={requestSteps} currentIndex={requestStepIndex[status]} />
        </div>
        {progressNote && (
          <p className="mt-4 rounded-lg bg-accent-soft/50 px-4 py-3 text-sm leading-relaxed">
            <span className="font-semibold text-ink">Eğitmen notu: </span>
            {progressNote}
          </p>
        )}
      </div>

      <div role="tablist" aria-label="Bireysel eğitim sekmeleri" className="scroll-fade-x mt-8 border-b border-line">
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
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold">Müfredat ilerlemen</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Eğitim durumuna göre müfredatta nerede olduğun aşağıda gösterilir.
              </p>
              <div className="mt-5">
                <WeekProgressTracker
                  compact
                  weeks={syllabus.filter((w) => w.week_number <= progress.effectiveWeek + 1)}
                  effectiveWeek={progress.effectiveWeek}
                  materials={[]}
                />
              </div>
            </section>
            <section className="space-y-4">
              <InfoCard icon={Package} label="Program" value={moduleTitle} />
              {bundleTitle && <InfoCard icon={Package} label="Paket" value={bundleTitle} />}
              {totalHours && <InfoCard icon={Clock} label="Toplam süre" value={`${totalHours} saat`} />}
              {requestType !== "schedule" && (
                <InfoCard icon={Package} label="Tutar" value={`${calculatedPrice.toLocaleString("tr-TR")}₺`} />
              )}
            </section>
          </div>
        )}

        {activeTab === "syllabus" && (
          <WeekProgressTracker weeks={syllabus} effectiveWeek={progress.effectiveWeek} materials={[]} />
        )}

        {activeTab === "info" && (
          <dl className="space-y-4 rounded-xl border border-line bg-white p-6 shadow-sm">
            <InfoRow label="Talep türü" value={requestTypeLabels[requestType]} />
            <InfoRow label="Modül" value={moduleTitle} />
            {bundleTitle && <InfoRow label="Paket" value={bundleTitle} />}
            <InfoRow label="Durum" value={requestStatusLabels[status]} />
            <InfoRow label="Oluşturulma" value={new Date(createdAt).toLocaleDateString("tr-TR")} />
            {totalHours && <InfoRow label="Süre" value={`${totalHours} saat`} />}
            {requestType !== "schedule" && (
              <InfoRow label="Hesaplanan tutar" value={`${calculatedPrice.toLocaleString("tr-TR")}₺`} />
            )}
            {userMessage && (
              <div>
                <dt className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
                  <MessageSquare className="size-4" aria-hidden /> Mesajın
                </dt>
                <dd className="mt-2 whitespace-pre-wrap rounded-lg bg-surface px-4 py-3 text-sm">{userMessage}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
      <span className="rounded-lg bg-accent-soft p-2.5 text-accent">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-medium text-ink-soft">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between">
      <dt className="text-sm font-medium text-ink-soft">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}
