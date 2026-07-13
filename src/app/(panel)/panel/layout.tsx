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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            Axis<span className="text-accent"> Akademi</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink-soft sm:inline">{displayName}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
        <PanelTabs />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
