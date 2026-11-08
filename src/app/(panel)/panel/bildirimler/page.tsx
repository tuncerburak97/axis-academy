// src/app/(panel)/panel/bildirimler/page.tsx — tüm bildirimler, gün gün
import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyNotifications } from "@/lib/queries/notifications";
import { istanbulDayKey } from "@/lib/queries/member-types";
import { formatWeekday } from "@/lib/format";
import { EmptyState } from "@/components/ui/feedback";
import { Accent, PageHeader } from "@/components/ui/page-header";
import { MarkAllReadButton, NotificationGroups } from "@/components/panel/notification-list";
import type { NotificationRow } from "@/lib/types/platform";

export const metadata: Metadata = { title: "Bildirimler" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireUser("/panel/bildirimler");
  const notifications = await getMyNotifications(200);
  const unread = notifications.filter((notification) => !notification.read_at).length;

  const today = istanbulDayKey(new Date());
  const yesterday = istanbulDayKey(new Date(Date.now() - 86_400_000));
  const groups: { label: string; items: NotificationRow[] }[] = [];
  for (const notification of notifications) {
    const key = istanbulDayKey(notification.created_at);
    const label = key === today ? "Bugün" : key === yesterday ? "Dün" : formatWeekday(notification.created_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(notification);
    else groups.push({ label, items: [notification] });
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={<Accent>Bildirimler</Accent>}
        description={unread ? `${unread} okunmamış bildirimin var.` : "Hepsini okudun."}
        actions={notifications.length > 0 ? <MarkAllReadButton disabled={unread === 0} /> : undefined}
      />
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Henüz bildirimin yok"
          description="Teklifler, mesajlar, kayıt onayları ve yeni materyaller burada görünür. Önemli olanları e-postayla da gönderiyoruz."
        />
      ) : (
        <NotificationGroups groups={groups} />
      )}
    </div>
  );
}
