// src/app/(panel)/panel/layout.tsx — üye paneli koruması: giriş yoksa /giris'e yönlendirir
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { PanelTabs } from "@/components/panel/panel-tabs";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  const displayName = profile?.full_name || user.email;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
          <Link href="/" className="shrink-0 font-display text-base font-bold tracking-tight sm:text-lg">
            Axis<span className="text-accent"> Akademi</span>
          </Link>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-4">
            <span className="max-w-[5.5rem] truncate text-xs text-ink-soft sm:max-w-none sm:text-sm">
              {displayName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="min-h-11 rounded-lg border border-line px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface sm:px-4"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
        <PanelTabs />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
