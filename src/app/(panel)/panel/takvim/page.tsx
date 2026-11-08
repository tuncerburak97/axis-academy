// src/app/(panel)/panel/takvim/page.tsx — takvim: dönem ve birebir oturumları hafta/gün gruplu ajanda
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronDown, Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMySessions } from "@/lib/queries/member";
import { istanbulDayKey, type MemberSession } from "@/lib/queries/member-types";
import { formatWeekday } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Accent, PageHeader } from "@/components/ui/page-header";
import { SessionItem } from "@/components/panel/session-item";

export const metadata: Metadata = { title: "Takvim" };
export const dynamic = "force-dynamic";

const monthLong = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function mondayKey(dayKey: string): string {
  const date = new Date(`${dayKey}T00:00:00Z`);
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

function weekLabel(weekKey: string, thisWeek: string): string {
  const start = new Date(`${weekKey}T00:00:00Z`);
  const diffWeeks = Math.round((start.getTime() - new Date(`${thisWeek}T00:00:00Z`).getTime()) / (7 * 86_400_000));
  if (diffWeeks === 0) return "Bu hafta";
  if (diffWeeks === 1) return "Gelecek hafta";
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const startText = `${start.getUTCDate()}${start.getUTCMonth() !== end.getUTCMonth() ? ` ${monthLong[start.getUTCMonth()]}` : ""}`;
  return `${startText}–${end.getUTCDate()} ${monthLong[end.getUTCMonth()]}`;
}

function groupByWeekAndDay(sessions: MemberSession[]) {
  const weeks = new Map<string, Map<string, MemberSession[]>>();
  for (const session of sessions) {
    const day = istanbulDayKey(session.starts_at);
    const week = mondayKey(day);
    if (!weeks.has(week)) weeks.set(week, new Map());
    const days = weeks.get(week)!;
    days.set(day, [...(days.get(day) ?? []), session]);
  }
  return weeks;
}

export default async function CalendarPage() {
  const user = await requireUser("/panel/takvim");
  const sessions = await getMySessions(user);
  const now = Date.now();
  const upcoming = sessions.filter((session) => new Date(session.ends_at).getTime() >= now);
  const past = sessions.filter((session) => new Date(session.ends_at).getTime() < now).reverse();
  const todayKey = istanbulDayKey(new Date());
  const thisWeek = mondayKey(todayKey);
  const weeks = groupByWeekAndDay(upcoming);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={
          <>
            <Accent>Takvim</Accent>
          </>
        }
        description="Dönem derslerin ve birebir oturumların tek yerde. Saatler Türkiye saatiyle gösterilir."
        actions={
          sessions.length > 0 ? (
            <Button asChild variant="outline">
              <a href="/panel/takvim/ics" download>
                <Download aria-hidden /> Tüm takvimi indir
              </a>
            </Button>
          ) : undefined
        }
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Takviminde henüz ders yok"
          description="Bir döneme kaydın onaylandığında ya da birebir eğitimin planlandığında dersler burada belirir."
          action={
            <Button asChild>
              <Link href="/programlar">Programları keşfet</Link>
            </Button>
          }
        />
      ) : (
        <>
          {upcoming.length === 0 ? (
            <Card variant="muted" className="text-sm text-ink-soft">
              Yaklaşan dersin yok. Yeni oturumlar eklendiğinde burada görünür.
            </Card>
          ) : (
            [...weeks.entries()].map(([weekKey, days]) => (
              <section key={weekKey} aria-labelledby={`hafta-${weekKey}`} className="flex flex-col gap-3">
                <h2 id={`hafta-${weekKey}`} className="text-lg font-semibold tracking-tight">
                  {weekLabel(weekKey, thisWeek)}
                </h2>
                <Card padding="none" className="divide-y divide-line">
                  {[...days.entries()].map(([dayKey, daySessions]) => (
                    <div key={dayKey} className="px-4 sm:px-5">
                      <p className="pt-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                        {dayKey === todayKey ? "Bugün · " : ""}
                        {formatWeekday(daySessions[0].starts_at)}
                      </p>
                      <ul className="divide-y divide-line">
                        {daySessions.map((session) => (
                          <SessionItem key={session.id} session={session} />
                        ))}
                      </ul>
                    </div>
                  ))}
                </Card>
              </section>
            ))
          )}

          {past.length > 0 && (
            <details className="group rounded-2xl border border-line bg-paper shadow-card">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold sm:px-5 [&::-webkit-details-marker]:hidden">
                <span>
                  Geçmiş dersler <span className="tabular font-mono text-ink-soft">({past.length})</span>
                </span>
                <ChevronDown className="size-4 text-ink-soft transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="divide-y divide-line border-t border-line px-4 sm:px-5">
                {past.map((session) => (
                  <SessionItem key={session.id} session={session} past />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
