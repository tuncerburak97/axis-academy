// src/app/(admin)/admin/(dashboard)/layout.tsx — admin koruması: admin olmayan herkes 404 görür
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { getActiveRequestCount } from "@/lib/queries/admin-requests";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "admin") notFound();

  const activeRequestCount = await getActiveRequestCount();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white p-4 md:flex">
        <Link href="/admin" className="px-3 py-2 font-display text-lg font-bold tracking-tight">
          Axis<span className="text-accent"> Admin</span>
        </Link>
        <div className="mt-4 flex-1">
          <AdminNav activeRequestCount={activeRequestCount} />
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface"
          >
            Çıkış Yap
          </button>
        </form>
      </aside>
      <main className="flex-1 bg-surface px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
