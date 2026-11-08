// src/app/(admin)/admin/(dashboard)/page.tsx — gelen kutusu: dikkat bekleyenler, hemen ilgilen listesi, bu haftanın oturumları, doluluk, son hareketler
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileQuestion,
  Hourglass,
  Inbox,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accent, PageHeader, SectionHeading } from "@/components/ui/page-header";
import { DateTile, SeatMeter, Stat } from "@/components/ui/data";
import { EmptyState } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { formatDateShort, formatRelative, formatTimeRange, formatWeekday } from "@/lib/format";
import { requireAdminUser, firstName } from "@/lib/auth";
import { getDashboardData, type AttentionItem } from "@/lib/queries/admin-dashboard";

export const metadata: Metadata = { title: "Gelen kutusu" };

const attentionIcon: Record<AttentionItem["kind"], typeof Inbox> = {
  request: Inbox,
  application: UserCheck,
  waitlist: Users,
  quote: FileQuestion,
};

const attentionLabel: Record<AttentionItem["kind"], string> = {
  request: "Talep",
  application: "Başvuru",
  waitlist: "Bekleme listesi",
  quote: "Teklif",
};

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Istanbul" }).format(new Date()));
  if (hour < 6) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

export default async function AdminInboxPage() {
  const [user, data] = await Promise.all([requireAdminUser(), getDashboardData()]);
  const total = data.attention.length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={formatWeekday(new Date())}
        title={
          <>
            {greeting()}, <Accent>{firstName(user)}</Accent>
          </>
        }
        description={
          total === 0
            ? "Bekleyen iş yok. Takvime ve dönem doluluklarına göz atabilirsin."
            : `${total} iş seni bekliyor${data.overdueRequests ? `; ${data.overdueRequests} talep 24 saatten uzun süredir yanıtsız` : ""}.`
        }
      />

      <section aria-label="Özet" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Link href="/admin/talepler?status=received" className="rounded-2xl focus-visible:outline-2">
          <Stat
            label="24 saati geçen yanıtsız talep"
            value={data.overdueRequests}
            icon={Clock}
            attention={data.overdueRequests > 0}
            hint={data.newRequests ? `Toplam ${data.newRequests} yanıtsız yeni talep` : "Yanıt bekleyen talep yok"}
            className="h-full"
          />
        </Link>
        <Link href="/admin/donemler" className="rounded-2xl">
          <Stat
            label="Onay bekleyen başvuru"
            value={data.pendingApplications}
            icon={UserCheck}
            attention={data.pendingApplications > 0}
            className="h-full"
          />
        </Link>
        <Link href="/admin/donemler" className="rounded-2xl">
          <Stat
            label="Yeri açılan dönem"
            value={data.waitlistOpenings}
            icon={Users}
            attention={data.waitlistOpenings > 0}
            hint="Bekleme listesi var, yer boş"
            className="h-full"
          />
        </Link>
        <Link href="/admin/talepler?status=quoted" className="rounded-2xl">
          <Stat label="Üyeden yanıt bekleyen teklif" value={data.openQuotes} icon={Hourglass} className="h-full" />
        </Link>
        <Link href="/admin/takvim" className="col-span-2 rounded-2xl md:col-span-1">
          <Stat label="Bu hafta oturum" value={data.weekSessionCount} icon={CalendarDays} className="h-full" />
        </Link>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex min-w-0 flex-col gap-4">
          <SectionHeading title="Hemen ilgilen" description="En eski bekleyen en üstte." />
          {data.attention.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Her şey yolunda" description="Yanıt bekleyen talep, onay bekleyen başvuru ya da açık yer yok." />
          ) : (
            <ul className="flex flex-col gap-2">
              {data.attention.slice(0, 12).map((item) => {
                const Icon = attentionIcon[item.kind];
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3.5 rounded-2xl border bg-paper p-3.5 shadow-card transition-[border-color,box-shadow] hover:shadow-raise",
                        item.overdue ? "border-amber/60" : "border-line hover:border-line-strong",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          item.overdue ? "bg-amber-soft text-amber-ink" : "bg-accent-soft text-accent",
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink">{item.title}</span>
                        <span className="block truncate text-sm text-ink-soft">{item.subtitle}</span>
                      </span>
                      <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <Badge size="sm" tone={item.overdue ? "amber" : "neutral"}>
                          {attentionLabel[item.kind]}
                        </Badge>
                        {item.since && (
                          <span className={cn("text-xs", item.overdue ? "font-semibold text-amber-ink" : "text-ink-soft")}>
                            {formatRelative(item.since)}
                          </span>
                        )}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {data.attention.length > 12 && (
            <p className="text-sm text-ink-soft">
              ve {data.attention.length - 12} iş daha. <Link href="/admin/talepler?status=received" className="font-semibold text-accent hover:underline">Taleplere git</Link>
            </p>
          )}

          <SectionHeading className="mt-4" title="Son hareketler" />
          <Card padding="none">
            {data.activity.length === 0 ? (
              <p className="p-5 text-sm text-ink-soft">Henüz kayıt yok.</p>
            ) : (
              <ol className="divide-y divide-line">
                {data.activity.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-line-strong" />
                    <div className="min-w-0 flex-1">
                      {item.href ? (
                        <Link href={item.href} className="font-medium text-ink hover:text-accent">
                          {item.text}
                        </Link>
                      ) : (
                        <p className="font-medium text-ink">{item.text}</p>
                      )}
                      <p className="text-xs text-ink-soft">{item.actor}</p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-soft">{formatRelative(item.at)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </section>

        <aside className="flex min-w-0 flex-col gap-6">
          <Card variant="inverse" padding="md">
            <CardEyebrow className="text-white/60">Bu hafta</CardEyebrow>
            {data.weekSessions.length === 0 ? (
              <p className="mt-3 text-sm text-white/70">Bu hafta planlı oturum yok.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {data.weekSessions.slice(0, 7).map((session) => (
                  <li key={session.id}>
                    <Link href={session.href} className="flex items-center gap-3 rounded-xl p-1 hover:bg-white/5">
                      <DateTile date={session.starts_at} tone="dark" className="w-12" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{session.ownerTitle}</span>
                        <span className="tabular block truncate font-mono text-xs text-white/70">
                          {formatTimeRange(session.starts_at, session.ends_at)} · {session.title || "Oturum"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="ghost" size="sm" className="mt-4 text-white hover:bg-white/10">
              <Link href="/admin/takvim">
                Takvimi aç <ArrowRight />
              </Link>
            </Button>
          </Card>

          <section className="flex flex-col gap-3">
            <SectionHeading as="h3" title="Yaklaşan dönemler" action={<Link href="/admin/donemler" className="text-sm font-semibold text-accent hover:underline">Tümü</Link>} />
            {data.occupancy.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Yaklaşan dönem yok. <Link href="/admin/donemler?yeni=1" className="font-semibold text-accent hover:underline">Yeni dönem aç</Link>
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.occupancy.map((cohort) => (
                  <li key={cohort.id}>
                    <Link href={`/admin/donemler/${cohort.id}`} className="block rounded-2xl border border-line bg-paper p-3.5 shadow-card hover:border-line-strong">
                      <div className="mb-2.5 flex items-baseline justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-semibold">{cohort.title}</span>
                        <span className="tabular shrink-0 font-mono text-xs text-ink-soft">{formatDateShort(cohort.start_date)}</span>
                      </div>
                      <SeatMeter taken={cohort.taken} capacity={cohort.capacity} />
                      {(cohort.pending > 0 || cohort.waitlisted > 0) && (
                        <p className="mt-2 text-xs text-amber-ink">
                          {cohort.pending > 0 && `${cohort.pending} onay bekliyor`}
                          {cohort.pending > 0 && cohort.waitlisted > 0 && " · "}
                          {cohort.waitlisted > 0 && `${cohort.waitlisted} bekleme listesinde`}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
