// src/app/(admin)/admin/(dashboard)/kullanicilar/page.tsx — kayıtlı kullanıcı listesi
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Kullanıcılar", robots: { index: false } };
export const dynamic = "force-dynamic";

interface UserRow {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  individual_requests: { count: number }[];
  class_enrollments: { count: number }[];
}

export default async function UserManagementPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, phone, role, created_at, individual_requests(count), class_enrollments(count)")
    .order("created_at", { ascending: false });

  const users = (data ?? []) as unknown as UserRow[];

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Kullanıcılar</h1>
      <p className="mt-1 text-sm text-ink-soft">{users.length} kayıtlı kullanıcı.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th scope="col" className="px-4 py-3 font-semibold">Ad Soyad</th>
              <th scope="col" className="px-4 py-3 font-semibold">E-posta</th>
              <th scope="col" className="px-4 py-3 font-semibold">Telefon</th>
              <th scope="col" className="px-4 py-3 font-semibold">Kayıt Tarihi</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Eğitim Talebi</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Sınıf Kaydı</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">
                  {user.full_name || "—"}
                  {user.role === "admin" && (
                    <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">ADMIN</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft">{user.email}</td>
                <td className="px-4 py-3 text-ink-soft">{user.phone || "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{new Date(user.created_at).toLocaleDateString("tr-TR")}</td>
                <td className="px-4 py-3 text-right">{user.individual_requests[0]?.count ?? 0}</td>
                <td className="px-4 py-3 text-right">{user.class_enrollments[0]?.count ?? 0}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">Henüz kayıtlı kullanıcı yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
