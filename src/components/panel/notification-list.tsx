// src/components/panel/notification-list.tsx — gün gruplu bildirim listesi; tıklayınca okundu işaretleyip ilgili sayfaya gider
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";
import { formatTime } from "@/lib/format";
import { notificationKindLabels, type NotificationRow } from "@/lib/types/platform";
import { cn } from "@/lib/utils";

export function MarkAllReadButton({ disabled }: { disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      loading={pending}
      disabled={disabled}
      onClick={() =>
        startTransition(async () => {
          await markAllNotificationsRead();
          toast.success("Tüm bildirimler okundu olarak işaretlendi.");
        })
      }
    >
      <CheckCheck aria-hidden /> Tümünü okundu işaretle
    </Button>
  );
}

export function NotificationGroups({ groups }: { groups: { label: string; items: NotificationRow[] }[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const open = (notification: NotificationRow) => {
    startTransition(async () => {
      if (!notification.read_at) await markNotificationRead(notification.id);
      if (notification.link) router.push(notification.link);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label} className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{group.label}</h2>
          <Card padding="none">
            <ul className="divide-y divide-line">
              {group.items.map((notification) => {
                const unread = !notification.read_at;
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => open(notification)}
                      className={cn(
                        "group flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface sm:px-5",
                        unread && "bg-accent-soft/40",
                      )}
                    >
                      <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", unread ? "bg-accent" : "bg-line-strong")} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className={cn("text-[15px] leading-snug", unread ? "font-semibold text-ink" : "text-ink-soft")}>
                          {notification.title}
                          {unread && <span className="sr-only"> (okunmadı)</span>}
                        </span>
                        {notification.body && <span className="line-clamp-2 text-sm text-ink-soft">{notification.body}</span>}
                        <span className="text-xs text-ink-muted">
                          {notificationKindLabels[notification.kind] ?? "Bilgi"} · <span className="tabular font-mono">{formatTime(notification.created_at)}</span>
                        </span>
                      </span>
                      {notification.link && <ChevronRight className="mt-1 size-4 shrink-0 text-ink-muted group-hover:text-ink" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      ))}
    </div>
  );
}
