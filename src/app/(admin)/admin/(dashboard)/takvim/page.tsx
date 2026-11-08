// src/app/(admin)/admin/(dashboard)/takvim/page.tsx — tüm oturumlar: hafta hafta ajanda (önceki/sonraki) ve ayın listesi
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader, SectionHeading } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { formatDateShort, formatTimeRange } from "@/lib/format";
import { getSessionsBetween, type CalendarSession } from "@/lib/queries/admin-calendar";
import { addDays, istanbulIso, mondayOf, splitIstanbul, todayIstanbul, weekdayNames, weekdayOf } from "@/components/admin/lib/time";

export const metadata: Metadata = { title: "Takvim" };

const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function SourceBadge({ session }: { session: CalendarSession }) {
  return (
    <Badge size="sm" tone={session.source === "cohort" ? "accent" : "amber"}>
      {session.source === "cohort" ? "Dönem" : "Birebir"}
    </Badge>
  );
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const today = todayIstanbul();
  const requested = params.hafta && /^\d{4}-\d{2}-\d{2}$/.test(params.hafta) ? params.hafta : today;
  const monday = mondayOf(requested);
  const sunday = addDays(monday, 6);
  const monthStart = `${monday.slice(0, 7)}-01`;
  const [year, month] = monday.split("-").map(Number);
  const nextMonthStart = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const [weekSessions, monthSessions] = await Promise.all([
    getSessionsBetween(istanbulIso(monday, "00:00"), istanbulIso(addDays(monday, 7), "00:00")),
    getSessionsBetween(istanbulIso(monthStart, "00:00"), istanbulIso(nextMonthStart, "00:00")),
  ]);

  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const byDay = new Map<string, CalendarSession[]>();
  for (const session of weekSessions) {
    const day = splitIstanbul(session.starts_at).date;
    byDay.set(day, [...(byDay.get(day) ?? []), session]);
  }
  const isThisWeek = monday === mondayOf(today);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Takvim"
        description="Dönem ve birebir eğitim oturumları. Saatler İstanbul saatine göre."
        actions={
          <div className="flex items-center gap-1">
            <Button asChild variant="outline" size="icon-sm" aria-label="Önceki hafta">
              <Link href={`/admin/takvim?hafta=${addDays(monday, -7)}`}>
                <ChevronLeft />
              </Link>
            </Button>
            {!isThisWeek && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/takvim">Bu hafta</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="icon-sm" aria-label="Sonraki hafta">
              <Link href={`/admin/takvim?hafta=${addDays(monday, 7)}`}>
                <ChevronRight />
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-label="Haftalık ajanda" className="flex min-w-0 flex-col gap-3">
          <p className="tabular font-mono text-sm text-ink-soft">
            {formatDateShort(monday)} – {formatDateShort(sunday)} · {weekSessions.length} oturum
          </p>
          {days.map((day) => {
            const list = byDay.get(day) ?? [];
            const isToday = day === today;
            return (
              <div
                key={day}
                className={cn(
                  "flex gap-4 rounded-2xl border bg-paper p-4 shadow-card",
                  isToday ? "border-accent/40 ring-2 ring-accent-soft" : "border-line",
                  list.length === 0 && "bg-paper/60 shadow-none",
                )}
              >
                <div className="w-24 shrink-0">
                  <p className={cn("text-sm font-semibold", isToday ? "text-accent" : "text-ink")}>{weekdayNames[weekdayOf(day)]}</p>
                  <p className="tabular font-mono text-xs text-ink-soft">{formatDateShort(day)}</p>
                  {isToday && <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">Bugün</p>}
                </div>
                <ul className="flex min-w-0 flex-1 flex-col gap-2">
                  {list.length === 0 && <li className="py-1 text-sm text-ink-muted">Oturum yok</li>}
                  {list.map((session) => (
                    <li key={session.id} className="flex items-center gap-3">
                      <span className="tabular w-24 shrink-0 font-mono text-sm">{formatTimeRange(session.starts_at, session.ends_at)}</span>
                      <Link href={session.href} className="min-w-0 flex-1 rounded-lg px-2 py-1 hover:bg-surface">
                        <span className="block truncate text-sm font-medium">
                          {session.week_number ? `H${session.week_number} · ` : ""}
                          {session.title || "Oturum"}
                        </span>
                        <span className="block truncate text-xs text-ink-soft">{session.ownerTitle}</span>
                      </Link>
                      <SourceBadge session={session} />
                      {session.meeting_url && (
                        <Button asChild variant="ghost" size="icon-sm" aria-label="Toplantı linki">
                          <a href={session.meeting_url} target="_blank" rel="noreferrer">
                            <Video />
                          </a>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <aside>
          <Card padding="sm" className="lg:sticky lg:top-24">
            <SectionHeading as="h3" title={`${monthNames[month - 1]} ${year}`} description={`${monthSessions.length} oturum`} />
            {monthSessions.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
                <CalendarDays className="size-4" aria-hidden /> Bu ay oturum yok.
              </p>
            ) : (
              <ul className="mt-3 flex max-h-[60vh] flex-col overflow-y-auto">
                {monthSessions.map((session) => {
                  const day = splitIstanbul(session.starts_at).date;
                  const inWeek = day >= monday && day <= sunday;
                  return (
                    <li key={session.id}>
                      <Link
                        href={`/admin/takvim?hafta=${mondayOf(day)}`}
                        className={cn("flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-surface", inWeek && "bg-accent-soft/60")}
                      >
                        <span className="tabular w-14 shrink-0 font-mono text-xs text-ink-soft">{formatDateShort(day)}</span>
                        <span className="min-w-0 flex-1 truncate">{session.ownerTitle}</span>
                        <span
                          aria-hidden
                          className={cn("size-1.5 shrink-0 rounded-full", session.source === "cohort" ? "bg-accent" : "bg-amber")}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
