// src/app/(admin)/admin/(dashboard)/layout.tsx — admin koruması ve konsol iskeleti; admin olmayan herkes 404 görür
import type { Metadata } from "next";
import { requireAdminUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminNavCounts } from "@/lib/queries/admin-shell";
import { getMyNotifications, getMyUnreadCount } from "@/lib/queries/notifications";

export const metadata: Metadata = {
  title: { default: "Konsol", template: "%s · Konsol | Axis Akademi" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser();
  const [counts, notifications, unreadCount] = await Promise.all([
    getAdminNavCounts(),
    getMyNotifications(12),
    getMyUnreadCount(),
  ]);

  return (
    <AdminShell
      user={{ name: user.displayName, email: user.email }}
      counts={counts}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </AdminShell>
  );
}
