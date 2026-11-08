// src/app/(admin)/admin/login/page.tsx — gizli yönetici girişi (önyüzde linki yok, arama motorlarına kapalı)
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Konsol girişi",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Zaten giriş yapmış bir admin doğrudan konsola geçer
  const user = await getSessionUser();
  if (user?.role === "admin") redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span aria-hidden className="flex size-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
            A
          </span>
          Axis <span className="accent-word text-accent">Akademi</span>
          <span className="ml-1 rounded-md bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft ring-1 ring-inset ring-line">
            Konsol
          </span>
        </div>
        <div className="rounded-3xl border border-line bg-paper p-6 shadow-raise sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">Konsola giriş</h1>
          <p className="mb-6 mt-1 text-sm text-ink-soft">Yalnızca Axis ekibi içindir.</p>
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
