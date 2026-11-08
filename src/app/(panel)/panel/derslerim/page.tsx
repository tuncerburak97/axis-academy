// src/app/(panel)/panel/derslerim/page.tsx — eğitmen: verdiğim dönemler (yalnızca eğitmen rolü)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Presentation, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTeachingCohorts } from "@/lib/queries/member-instructor";
import { formatDate, formatRelative } from "@/lib/format";
import { cohortCurrentWeek, cohortStatusLabels, type CohortStatus } from "@/lib/types/platform";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Accent, PageHeader } from "@/components/ui/page-header";
import { WeekStrip } from "@/components/ui/progress";

export const metadata: Metadata = { title: "Derslerim" };
export const dynamic = "force-dynamic";

export default async function TeachingPage() {
  const user = await requireUser("/panel/derslerim");
  if (user.role !== "instructor") notFound();
  const cohorts = await getTeachingCohorts(user.id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={<Accent>Derslerim</Accent>} description="Eğitmeni olduğun dönemler: oturumları planla, duyuru yap, materyal paylaş." />
      {cohorts.length === 0 ? (
        <EmptyState icon={Presentation} title="Sana atanmış dönem yok" description="Bir döneme eğitmen olarak atandığında burada görünür." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cohorts.map((cohort) => {
            const total = Math.max(cohort.duration_weeks, 1);
            const current = cohort.status === "completed" ? total + 1 : cohortCurrentWeek(cohort.start_date, total, cohort.current_week_override);
            return (
              <Link key={cohort.id} href={`/panel/derslerim/${cohort.id}`} className="group block">
                <Card variant="interactive" className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold group-hover:text-accent">{cohort.education_modules?.title ?? cohort.title}</p>
                      <p className="mt-0.5 truncate text-sm text-ink-soft">{cohort.title}</p>
                    </div>
                    <Badge tone={cohort.status === "completed" ? "success" : cohort.status === "cancelled" ? "danger" : "accent"} size="sm" dot>
                      {cohortStatusLabels[cohort.status as CohortStatus] ?? cohort.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" aria-hidden /> {formatDate(cohort.start_date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-4" aria-hidden /> <span className="tabular font-mono text-ink">{cohort.studentCount}</span>/{cohort.capacity} öğrenci
                    </span>
                  </div>
                  <WeekStrip total={total} current={current} />
                  <p className="mt-auto flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{cohort.nextSession ? `Sıradaki oturum ${formatRelative(cohort.nextSession)}` : "Planlanmış oturum yok"}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-accent">
                      Yönet <ArrowRight className="size-4" aria-hidden />
                    </span>
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
