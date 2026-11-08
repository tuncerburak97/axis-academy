// src/app/(panel)/panel/layout.tsx — üye alanı kabuğu: giriş koruması, kenar çubuğu, üst çubuk, mobil alt sekmeler
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getMyNotifications, getMyUnreadCount } from "@/lib/queries/notifications";
import { getMyAwaitingRequestCount } from "@/lib/queries/member";
import { MobileTabbar, PanelSidebar } from "@/components/panel/panel-nav";
import { PanelTopbar } from "@/components/panel/panel-topbar";

export const metadata: Metadata = {
  title: { default: "Üye alanı", template: "%s · Üye alanı | Axis Akademi" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/panel");
  const [notifications, unreadCount, awaitingCount] = await Promise.all([
    getMyNotifications(8),
    getMyUnreadCount(),
    getMyAwaitingRequestCount(user.id),
  ]);
  const nav = { role: user.role, awaitingCount, unreadCount };

  return (
    <div className="min-h-dvh bg-canvas text-ink print:bg-white">
      <PanelSidebar {...nav} />
      <div className="flex min-h-dvh flex-col lg:pl-64 print:pl-0">
        <PanelTopbar displayName={user.displayName} email={user.email} notifications={notifications} unreadCount={unreadCount} />
        <main
          id="icerik"
          className="mx-auto w-full max-w-6xl flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-2 print:max-w-none print:p-0"
        >
          {children}
        </main>
      </div>
      <MobileTabbar {...nav} />
    </div>
  );
}
