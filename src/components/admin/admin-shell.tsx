// src/components/admin/admin-shell.tsx — admin konsolu iskeleti: gruplu kenar çubuğu, üst çubuk (⌘K, bildirim, kullanıcı), mobil çekmece
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ExternalLink, LogOut, Menu as MenuIcon, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Avatar, Kbd } from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { logout } from "@/lib/actions/auth";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";
import type { AdminNavCounts } from "@/lib/queries/admin-shell";
import type { NotificationRow } from "@/lib/types/platform";
import { adminNavGroups, isNavActive } from "@/components/admin/nav-config";
import { CommandPalette } from "@/components/admin/command-palette";

interface AdminShellProps {
  user: { name: string; email: string };
  counts: AdminNavCounts;
  notifications: NotificationRow[];
  unreadCount: number;
  children: React.ReactNode;
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2 rounded-lg px-2 py-1 text-[15px] font-semibold tracking-tight text-ink">
      <span aria-hidden className="flex size-7 items-center justify-center rounded-lg bg-ink text-xs font-bold text-white">
        A
      </span>
      <span>
        Axis <span className="accent-word text-accent">Akademi</span>
      </span>
      <span className="ml-1 rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft ring-1 ring-inset ring-line">
        Konsol
      </span>
    </Link>
  );
}

function NavList({ counts, onNavigate }: { counts: AdminNavCounts; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin menüsü" className="flex flex-col gap-5">
      {adminNavGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{group.label}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isNavActive(pathname, item);
              const count = item.count ? counts[item.count] : 0;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                      active ? "bg-paper text-ink shadow-card ring-1 ring-line" : "text-ink-soft hover:bg-paper/70 hover:text-ink",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active ? "text-accent" : "text-ink-muted")} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "tabular rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold",
                          active ? "bg-accent text-white" : "bg-amber-soft text-amber-ink",
                        )}
                      >
                        {count}
                        <span className="sr-only"> bekleyen</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NotificationBell({ notifications, unreadCount }: { notifications: NotificationRow[]; unreadCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={unreadCount ? `Bildirimler, ${unreadCount} okunmamış` : "Bildirimler"} className="relative">
          <Bell />
          {unreadCount > 0 && (
            <span className="tabular absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-amber px-1 font-mono text-[10px] font-bold leading-4 text-ink">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </MenuTrigger>
      <MenuContent className="w-[min(92vw,360px)] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
          <p className="text-sm font-semibold">Bildirimler</p>
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => markAllNotificationsRead())}
              className="text-xs font-semibold text-accent hover:underline disabled:opacity-50"
            >
              Tümünü okundu say
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto p-1.5">
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-soft">Yeni bildirim yok.</p>
          ) : (
            notifications.map((item) => (
              <MenuItem
                key={item.id}
                className="h-auto items-start py-2.5"
                onSelect={() => {
                  startTransition(async () => {
                    if (!item.read_at) await markNotificationRead(item.id);
                  });
                  if (item.link) router.push(item.link);
                }}
              >
                <span
                  aria-hidden
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", item.read_at ? "bg-transparent" : "bg-accent")}
                />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", item.read_at ? "text-ink-soft" : "font-semibold text-ink")}>{item.title}</span>
                  {item.body && <span className="mt-0.5 line-clamp-2 block text-xs text-ink-soft">{item.body}</span>}
                  <span className="mt-1 block text-[11px] text-ink-muted">{formatRelative(item.created_at)}</span>
                </span>
              </MenuItem>
            ))
          )}
        </div>
      </MenuContent>
    </Menu>
  );
}

function UserMenu({ user }: { user: AdminShellProps["user"] }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          className="flex min-h-9 items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-surface sm:pr-3"
          aria-label="Hesap menüsü"
        >
          <Avatar name={user.name} size="sm" />
          <span className="hidden max-w-36 truncate text-sm font-medium sm:block">{user.name}</span>
        </button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel className="normal-case tracking-normal">
          <span className="block text-sm font-semibold text-ink">{user.name}</span>
          <span className="block truncate text-xs font-normal text-ink-soft">{user.email}</span>
        </MenuLabel>
        <MenuSeparator />
        <MenuItem asChild>
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink /> Siteyi aç
          </a>
        </MenuItem>
        <MenuItem
          tone="danger"
          onSelect={() => {
            void logout();
          }}
        >
          <LogOut /> Çıkış
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function AdminShell({ user, counts, notifications, unreadCount, children }: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Masaüstü kenar çubuğu */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-canvas lg:flex">
        <div className="flex h-16 shrink-0 items-center px-4">
          <Brand />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-2">
          <NavList counts={counts} />
        </div>
      </aside>

      {/* Mobil çekmece */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="gap-0 bg-canvas p-0">
          <SheetTitle className="sr-only">Admin menüsü</SheetTitle>
          <div className="flex h-16 shrink-0 items-center px-4">
            <Brand />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
            <NavList counts={counts} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-canvas/85 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Menüyü aç" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </Button>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex min-h-9 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line bg-paper px-3 text-left text-sm text-ink-muted shadow-card transition-colors hover:border-line-strong sm:max-w-sm"
          >
            <Search className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate">Ara ya da git…</span>
            <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
            <UserMenu user={user} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
