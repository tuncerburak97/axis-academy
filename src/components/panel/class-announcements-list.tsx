// src/components/panel/class-announcements-list.tsx — öğrenci paneli duyuru listesi (salt okunur)
import ReactMarkdown from "react-markdown";
import { Megaphone } from "lucide-react";
import type { ClassAnnouncement } from "@/lib/types/catalog";

interface ClassAnnouncementsListProps {
  announcements: ClassAnnouncement[];
}

export function ClassAnnouncementsList({ announcements }: ClassAnnouncementsListProps) {
  if (announcements.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-soft">
        Henüz duyuru yok. Eğitmen duyuruları burada görünecek.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((item) => (
        <article key={item.id} className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <Megaphone className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <time
                dateTime={item.created_at}
                className="mt-1 block text-xs text-ink-soft"
              >
                {new Date(item.created_at).toLocaleString("tr-TR")}
              </time>
              {item.body && (
                <div className="prose-custom mt-4 text-sm leading-relaxed text-ink-soft">
                  <ReactMarkdown>{item.body}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
