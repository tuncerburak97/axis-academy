// src/app/(admin)/admin/(dashboard)/page.tsx — genel bakış: kullanıcı/sınıf/talep sayaçları
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Users, School, Inbox, GraduationCap, MessageSquareText } from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false } };

// Sayaçlar her istekte taze okunur
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Bağımsız sayımlar paralel çalışır; count sorguları satır taşımaz (head: true)
  const [users, openClasses, newContactRequests, receivedIndividualRequests, newInquiries] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("classes").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("contact_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("individual_requests").select("*", { count: "exact", head: true }).eq("status", "received"),
    supabase.from("public_inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const pendingRequestCount = (newContactRequests.count ?? 0) + (receivedIndividualRequests.count ?? 0);

  const stats = [
    { label: "Kayıtlı Kullanıcı", value: users.count ?? 0, icon: Users },
    { label: "Açık Sınıf", value: openClasses.count ?? 0, icon: School },
    { label: "Bekleyen Talep", value: pendingRequestCount, icon: Inbox },
    { label: "Yeni Eğitim Talebi", value: receivedIndividualRequests.count ?? 0, icon: GraduationCap },
    { label: "Yanıt Bekleyen Soru", value: newInquiries.count ?? 0, icon: MessageSquareText },
  ];

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Sitenin genel durumuna hızlı bakış.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <span className="inline-flex rounded-lg bg-accent-soft p-2.5 text-accent">
              <stat.icon className="size-5" aria-hidden />
            </span>
            <p className="mt-3 font-display text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* TODO: sınıf doluluk özeti ve son talepler listesi eklenecek */}
    </>
  );
}
