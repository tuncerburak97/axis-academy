// src/components/panel/session-item.tsx — ders oturumu satırı ve "Sıradaki ders" odak kartı
import Link from "next/link";
import { CalendarPlus, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow } from "@/components/ui/card";
import { DateTile } from "@/components/ui/data";
import { formatRelative, formatTimeRange, formatWeekday } from "@/lib/format";
import { sessionIsLive, type MemberSession } from "@/lib/queries/member-types";
import { cn } from "@/lib/utils";

const sourceLabels = { cohort: "Dönem", request: "Birebir", teaching: "Eğitmen" } as const;

function isOnline(session: MemberSession) {
  return !session.location || session.location.toLowerCase() === "online";
}

export function SessionItem({ session, showSource = true, past = false }: { session: MemberSession; showSource?: boolean; past?: boolean }) {
  const live = !past && sessionIsLive(session);
  return (
    <li className={cn("flex gap-3 py-3.5 sm:gap-4", past && "opacity-70")}>
      <DateTile date={session.starts_at} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="tabular font-mono text-sm font-medium">{formatTimeRange(session.starts_at, session.ends_at)}</span>
          {live && (
            <Badge tone="success" size="sm" dot>
              Şimdi
            </Badge>
          )}
          {showSource && (
            <Badge tone={session.source.kind === "request" ? "info" : "neutral"} size="sm">
              {sourceLabels[session.source.kind]}
            </Badge>
          )}
        </div>
        <p className="truncate text-[15px] font-semibold">
          {session.title || session.source.title}
          {session.week_number ? <span className="font-normal text-ink-soft"> · Hafta {session.week_number}</span> : null}
        </p>
        {showSource && (
          <Link href={session.source.href} className="w-fit truncate text-sm text-ink-soft hover:text-ink hover:underline">
            {session.source.title}
          </Link>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
          {isOnline(session) ? (
            session.meeting_url && !past ? (
              <a
                href={session.meeting_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
              >
                <Video className="size-4" aria-hidden /> {live ? "Derse katıl" : "Ders bağlantısı"}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-ink-soft">
                <Video className="size-4" aria-hidden /> Online
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 text-ink-soft">
              <MapPin className="size-4" aria-hidden /> {session.location}
            </span>
          )}
          {!past && (
            <a
              href={`/panel/takvim/${session.id}/ics`}
              className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink"
              download
            >
              <CalendarPlus className="size-4" aria-hidden /> Takvime ekle
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

/** Bugün ekranının tek odak noktası: sıradaki ders */
export function NextSessionCard({ session }: { session: MemberSession }) {
  const live = sessionIsLive(session);
  return (
    <Card variant="inverse" padding="lg" className="@container overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="relative flex flex-col gap-5 @2xl:flex-row @2xl:items-end @2xl:justify-between">
        <div className="flex min-w-0 gap-4">
          <DateTile date={session.starts_at} tone="dark" className="w-16 self-start" />
          <div className="min-w-0">
            <CardEyebrow className="text-white/60">{live ? "Ders şu an" : "Sıradaki ders"}</CardEyebrow>
            <p className="mt-1.5 text-xl font-semibold tracking-tight text-balance @lg:text-2xl">{session.title || session.source.title}</p>
            <p className="mt-1 text-sm text-white/70">
              <Link href={session.source.href} className="hover:text-white hover:underline">
                {session.source.title}
              </Link>
              {session.week_number ? ` · Hafta ${session.week_number}` : ""}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-white/80">
              <span>{formatWeekday(session.starts_at)}</span>
              <span className="tabular font-mono text-white">{formatTimeRange(session.starts_at, session.ends_at)}</span>
              {!live && <span className="text-accent-glow">· {formatRelative(session.starts_at)}</span>}
            </p>
            {!isOnline(session) && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/70">
                <MapPin className="size-4" aria-hidden /> {session.location}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {session.meeting_url && (
            <Button asChild variant={live ? "primary" : "outline"} className={cn(!live && "border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10")}>
              <a href={session.meeting_url} target="_blank" rel="noreferrer">
                <Video aria-hidden /> {live ? "Derse katıl" : "Ders bağlantısı"}
              </a>
            </Button>
          )}
          <Button asChild variant="ghost" className="text-white hover:bg-white/10">
            <a href={`/panel/takvim/${session.id}/ics`} download>
              <CalendarPlus aria-hidden /> Takvime ekle
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
