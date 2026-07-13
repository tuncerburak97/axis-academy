// src/app/(admin)/admin/(dashboard)/layout.tsx — admin koruması: admin olmayan herkes 404 görür
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminShell } from "@/components/admin/admin-shell";
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
    <AdminShell
      activeRequestCount={activeRequestCount}
      logoutButton={<AdminLogoutButton />}
    >
      {children}
    </AdminShell>
  );
}
