// src/components/admin/sessions/session-list.tsx — oturum listesi (tarih yaprağı, saat, link) ve düzenle/sil
import { CalendarPlus, Pencil, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTile } from "@/components/ui/data";
import { EmptyState } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { formatTimeRange, formatWeekday } from "@/lib/format";
import { deleteSession } from "@/lib/actions/admin-sessions";
import type { SessionRow } from "@/lib/types/platform";
import { ConfirmAction } from "@/components/admin/action-form";
import { SessionDialog } from "@/components/admin/sessions/session-dialog";

interface SessionListProps {
  sessions: SessionRow[];
  classId?: string;
  requestId?: string;
  withWeek?: boolean;
  defaults?: { location?: string; meeting_url?: string };
  emptyHint?: string;
}

export function SessionList({ sessions, classId, requestId, withWeek, defaults, emptyHint }: SessionListProps) {
  const now = Date.now();
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="Henüz oturum yok"
        description={emptyHint ?? "İlk oturumu ekle; üye takviminde ve hatırlatmalarda görür."}
        action={
          <SessionDialog
            classId={classId}
            requestId={requestId}
            withWeek={withWeek}
            defaults={defaults}
            trigger={
              <Button variant="outline">
                <CalendarPlus /> Oturum ekle
              </Button>
            }
          />
        }
      />
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-line">
      {sessions.map((session) => {
        const past = new Date(session.ends_at).getTime() < now;
        return (
          <li key={session.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <DateTile date={session.starts_at} className={past ? "opacity-60" : undefined} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {session.week_number && (
                  <Badge size="sm" tone="neutral">
                    Hafta {session.week_number}
                  </Badge>
                )}
                <p className="min-w-0 truncate font-medium">{session.title || "Oturum"}</p>
                {past && (
                  <Badge size="sm" tone="success">
                    Geçti
                  </Badge>
                )}
              </div>
              <p className="tabular mt-0.5 font-mono text-xs text-ink-soft">
                {formatWeekday(session.starts_at)} · {formatTimeRange(session.starts_at, session.ends_at)} · {session.location}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              {session.meeting_url && (
                <Button asChild variant="ghost" size="icon-sm" aria-label="Toplantı linkini aç">
                  <a href={session.meeting_url} target="_blank" rel="noreferrer">
                    <Video />
                  </a>
                </Button>
              )}
              <SessionDialog
                session={session}
                withWeek={withWeek}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label="Oturumu düzenle">
                    <Pencil />
                  </Button>
                }
              />
              <ConfirmAction
                title="Oturum silinsin mi?"
                description={`${session.title || "Oturum"} takvimden kaldırılacak. Üyelere ayrıca haber vermek istersen mesaj gönder.`}
                action={deleteSession}
                fields={{ session_id: session.id }}
                confirmLabel="Sil"
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label="Oturumu sil">
                    <Trash2 />
                  </Button>
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
