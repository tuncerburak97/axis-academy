// src/components/panel/panel-topbar.tsx — üst çubuk: bildirim zili (son 8) ve kullanıcı menüsü
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowUpRight, Bell, CheckCheck, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/data";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";
import { logout } from "@/lib/actions/auth";
import { formatRelative } from "@/lib/format";
import { notificationKindLabels, type NotificationRow } from "@/lib/types/platform";
import { cn } from "@/lib/utils";
import { PanelLogo } from "@/components/panel/panel-logo";

export interface PanelTopbarProps {
  displayName: string;
  email: string;
  notifications: NotificationRow[];
  unreadCount: number;
}

export function PanelTopbar({ displayName, email, notifications, unreadCount }: PanelTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur print:hidden lg:border-transparent">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-16 lg:justify-end lg:px-10">
        <PanelLogo className="lg:hidden" />
        <div className="flex items-center gap-1.5">
          <NotificationBell notifications={notifications} unreadCount={unreadCount} />
          <UserMenu displayName={displayName} email={email} />
        </div>
      </div>
    </header>
  );
}

function NotificationBell({ notifications, unreadCount }: { notifications: NotificationRow[]; unreadCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const open = (notification: NotificationRow) => {
    startTransition(async () => {
      if (!notification.read_at) await markNotificationRead(notification.id);
      router.push(notification.link || "/panel/bildirimler");
    });
  };

  return (
    <Menu>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={unreadCount ? `Bildirimler, ${unreadCount} okunmamış` : "Bildirimler"}
        >
          <Bell className="!size-5" aria-hidden />
          {unreadCount > 0 && (
            <span className="tabular absolute right-1.5 top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-semibold leading-[18px] text-white ring-2 ring-canvas">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </MenuTrigger>
      <MenuContent className="w-[min(92vw,380px)] p-0" align="end">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          <p className="text-sm font-semibold">Bildirimler</p>
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => markAllNotificationsRead())}
              className="inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-accent hover:underline disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" aria-hidden />
              Tümünü okundu işaretle
            </button>
          )}
        </div>
        <div className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5">
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-soft">Henüz bildirimin yok. Talep ve eğitimlerindeki gelişmeler burada görünür.</p>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onSelect={() => open(notification)}
                className="min-h-0 items-start gap-3 px-2.5 py-2.5"
              >
                <span
                  aria-hidden
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", notification.read_at ? "bg-transparent" : "bg-accent")}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={cn("text-sm leading-snug", notification.read_at ? "text-ink-soft" : "font-semibold text-ink")}>
                    {notification.title}
                  </span>
                  {notification.body && <span className="line-clamp-2 text-xs text-ink-soft">{notification.body}</span>}
                  <span className="text-[11px] text-ink-muted">
                    {notificationKindLabels[notification.kind] ?? "Bilgi"} · {formatRelative(notification.created_at)}
                  </span>
                </span>
              </MenuItem>
            ))
          )}
        </div>
        <div className="border-t border-line p-1.5">
          <MenuItem asChild className="justify-center font-semibold text-accent">
            <Link href="/panel/bildirimler">Tüm bildirimler</Link>
          </MenuItem>
        </div>
      </MenuContent>
    </Menu>
  );
}

function UserMenu({ displayName, email }: { displayName: string; email: string }) {
  const [, startTransition] = useTransition();
  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          className="flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-surface sm:pr-3"
          aria-label={`Hesap menüsü: ${displayName}`}
        >
          <Avatar name={displayName} size="md" />
          <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">{displayName}</span>
        </button>
      </MenuTrigger>
      <MenuContent className="w-60">
        <div className="px-2.5 pb-2 pt-1.5">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className="truncate text-xs text-ink-soft">{email}</p>
        </div>
        <MenuSeparator />
        <MenuLabel className="sr-only">Hesap</MenuLabel>
        <MenuItem asChild>
          <Link href="/panel/hesap">
            <UserRound aria-hidden /> Hesap ayarları
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/">
            <ArrowUpRight aria-hidden /> Siteye dön
          </Link>
        </MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger" onSelect={() => startTransition(() => logout())}>
          <LogOut aria-hidden /> Çıkış yap
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
