// src/app/(panel)/panel/hesap/page.tsx — Hesap: profil ve iletişim bilgileri güncelleme
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/panel/profile-form";

export const metadata: Metadata = { title: "Hesap" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">Hesap</h1>
      <p className="mt-1 text-sm text-ink-soft">Profil ve iletişim bilgilerini güncelle.</p>
      <div className="mt-6">
        <ProfileForm
          fullName={profile?.full_name ?? ""}
          phone={profile?.phone ?? ""}
          email={user.email ?? ""}
        />
      </div>
    </div>
  );
}
