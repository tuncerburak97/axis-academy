// src/app/(admin)/admin/(dashboard)/kullanicilar/page.tsx — kayıtlı kullanıcı listesi + hard delete
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { deleteUser } from "@/lib/actions/admin-delete";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { StatusBanner } from "@/components/admin/fields";

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

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, phone, role, created_at, individual_requests(count), class_enrollments(count)")
    .order("created_at", { ascending: false });

  const users = (data ?? []) as unknown as UserRow[];

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Kullanıcılar</h1>
      <p className="mt-1 text-sm text-ink-soft">{users.length} kayıtlı kullanıcı.</p>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {users.map((user) => (
          <article key={user.user_id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{user.full_name || "—"}</p>
              {user.role === "admin" && (
                <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">ADMIN</span>
              )}
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">E-posta</dt>
                <dd className="truncate text-right font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Telefon</dt>
                <dd>{user.phone || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Kayıt</dt>
                <dd>{new Date(user.created_at).toLocaleDateString("tr-TR")}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-2">
                <dt className="text-ink-soft">Eğitim talebi</dt>
                <dd className="font-semibold">{user.individual_requests[0]?.count ?? 0}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Sınıf kaydı</dt>
                <dd className="font-semibold">{user.class_enrollments[0]?.count ?? 0}</dd>
              </div>
            </dl>
            {user.user_id !== currentUser?.id && (
              <div className="mt-4 border-t border-line pt-3">
                <ConfirmDeleteButton
                  action={deleteUser}
                  hiddenFields={[{ name: "user_id", value: user.user_id }]}
                  label="Kullanıcıyı Sil"
                  confirmTitle="Kullanıcıyı kalıcı olarak sil?"
                  confirmMessage={`${user.full_name || user.email} hesabı ve tüm ilişkili verileri silinecek.`}
                />
              </div>
            )}
          </article>
        ))}
        {users.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-ink-soft">
            Henüz kayıtlı kullanıcı yok.
          </p>
        )}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-xl border border-line bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th scope="col" className="px-4 py-3 font-semibold">Ad Soyad</th>
              <th scope="col" className="px-4 py-3 font-semibold">E-posta</th>
              <th scope="col" className="px-4 py-3 font-semibold">Telefon</th>
              <th scope="col" className="px-4 py-3 font-semibold">Kayıt Tarihi</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Eğitim Talebi</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Sınıf Kaydı</th>
              <th scope="col" className="px-4 py-3 font-semibold"><span className="sr-only">İşlemler</span></th>
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
                <td className="px-4 py-3">
                  {user.user_id !== currentUser?.id && (
                    <ConfirmDeleteButton
                      action={deleteUser}
                      hiddenFields={[{ name: "user_id", value: user.user_id }]}
                      label="Sil"
                      confirmTitle="Kullanıcıyı kalıcı olarak sil?"
                      confirmMessage={`${user.full_name || user.email} hesabı ve tüm ilişkili verileri silinecek.`}
                    />
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">Henüz kayıtlı kullanıcı yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
