// src/app/(admin)/admin/(dashboard)/donemler/page.tsx — dönemler: yaklaşan / devam eden / tamamlanan / iptal sekmeleri, doluluk ve bekleyen başvurular
import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DateTile, SeatMeter } from "@/components/ui/data";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate, formatTRY } from "@/lib/format";
import { cohortStatusLabels, type CohortStatus } from "@/lib/types/platform";
import {
  cohortEndDate,
  getAdminCohorts,
  getInstructorOptions,
  getProgramOptions,
  type AdminCohortListItem,
  type CohortBucket,
} from "@/lib/queries/admin-cohorts";
import { UrlTabs } from "@/components/admin/url-tabs";
import { NewCohortDialog } from "@/components/admin/cohorts/new-cohort-dialog";

export const metadata: Metadata = { title: "Dönemler" };

const TABS: { value: CohortBucket; label: string; empty: string }[] = [
  { value: "upcoming", label: "Yaklaşan", empty: "Yaklaşan dönem yok. Yeni bir dönem aç; katalogda hemen görünür." },
  { value: "ongoing", label: "Devam eden", empty: "Şu an devam eden dönem yok." },
  { value: "completed", label: "Tamamlanan", empty: "Tamamlanan dönem yok. Bir dönem bitince “Dönemi tamamla” ile sertifikaları üret." },
  { value: "cancelled", label: "İptal", empty: "İptal edilen dönem yok." },
];

function CohortRowItem({ cohort }: { cohort: AdminCohortListItem }) {
  return (
    <li>
      <Link
        href={`/admin/donemler/${cohort.id}`}
        className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-4 shadow-card transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-raise sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <DateTile date={cohort.start_date} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{cohort.title}</p>
            <p className="mt-0.5 truncate text-sm text-ink-soft">
              {cohort.program?.title ?? "Program yok"} · {cohort.instructor ?? "Eğitmen atanmadı"}
            </p>
            <p className="tabular mt-0.5 font-mono text-xs text-ink-soft">
              {formatDate(cohort.start_date)} → {formatDate(cohortEndDate(cohort.start_date, cohort.duration_weeks))}
              {cohort.price ? ` · ${formatTRY(cohort.price)}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {cohort.pending > 0 && (
            <Badge tone="amber" size="sm" dot>
              {cohort.pending} onay bekliyor
            </Badge>
          )}
          {cohort.waitlisted > 0 && (
            <Badge tone="info" size="sm" dot>
              {cohort.waitlisted} bekleme listesinde
            </Badge>
          )}
          {(cohort.bucket === "completed" || cohort.bucket === "cancelled") && (
            <Badge tone={cohort.bucket === "completed" ? "success" : "danger"} size="sm">
              {cohortStatusLabels[cohort.status as CohortStatus]}
            </Badge>
          )}
        </div>
        <SeatMeter taken={cohort.taken} capacity={cohort.capacity} className="sm:w-44" />
      </Link>
    </li>
  );
}

export default async function CohortsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [cohorts, programs, instructors] = await Promise.all([getAdminCohorts(), getProgramOptions(), getInstructorOptions()]);
  const tab = TABS.some((item) => item.value === params.tab) ? (params.tab as CohortBucket) : "upcoming";
  const pendingTotal = cohorts.reduce((sum, cohort) => sum + cohort.pending, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dönemler"
        description={
          pendingTotal > 0
            ? `${pendingTotal} başvuru onay bekliyor. Dönemi açıp Öğrenciler sekmesinden onayla.`
            : "Grup eğitimlerinin dönemleri, doluluk ve başvurular."
        }
        actions={<NewCohortDialog programs={programs} instructors={instructors} defaultOpen={params.yeni === "1"} />}
      />
      <UrlTabs defaultValue={tab}>
        <TabsList>
          {TABS.map((item) => {
            const count = cohorts.filter((cohort) => cohort.bucket === item.value).length;
            return (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
                <span className="tabular rounded-full bg-surface px-1.5 font-mono text-[11px] text-ink-soft">{count}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {TABS.map((item) => {
          const list = cohorts.filter((cohort) => cohort.bucket === item.value);
          if (item.value === "completed" || item.value === "cancelled") list.reverse();
          return (
            <TabsContent key={item.value} value={item.value}>
              {list.length === 0 ? (
                <EmptyState icon={GraduationCap} title="Burada dönem yok" description={item.empty} />
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {list.map((cohort) => (
                    <CohortRowItem key={cohort.id} cohort={cohort} />
                  ))}
                </ul>
              )}
            </TabsContent>
          );
        })}
      </UrlTabs>
    </div>
  );
}
