// src/app/(panel)/panel/talepler/page.tsx — Taleplerim: analiz/tez + eğitim talep geçmişi
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getMyContactRequests, getMyIndividualRequests } from "@/lib/queries/member";
import {
  contactStatusLabels,
  requestStatusLabels,
  requestTypeLabels,
  serviceTypeLabels,
} from "@/lib/types/catalog";
import { StatusBanner } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Taleplerim" };
export const dynamic = "force-dynamic";

export default async function MyRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const [contactRequests, individualRequests] = await Promise.all([
    getMyContactRequests(),
    getMyIndividualRequests(),
  ]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Taleplerim</h1>
          <p className="mt-1 text-sm text-ink-soft">Analiz, tez ve eğitim taleplerinin geçmişi.</p>
        </div>
        <Link
          href="/panel/talepler/yeni"
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong sm:w-auto"
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          <span className="sm:hidden">Yeni Talep</span>
          <span className="hidden sm:inline">Yeni Analiz/Tez Talebi</span>
        </Link>
      </div>

      <div className="mt-6">
        <StatusBanner saved={saved} />
      </div>

      <section aria-labelledby="contact-requests-heading">
        <h2 id="contact-requests-heading" className="font-display text-lg font-semibold">Analiz / Tez Talepleri</h2>
        <div className="mt-3 space-y-3">
          {contactRequests.map((request) => (
            <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <p className="font-semibold">{serviceTypeLabels[request.service_type]}</p>
                <p className="mt-0.5 truncate text-sm text-ink-soft">{request.message}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{new Date(request.created_at).toLocaleDateString("tr-TR")}</p>
              </div>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {contactStatusLabels[request.status]}
              </span>
            </div>
          ))}
          {contactRequests.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
              Henüz analiz veya tez talebin yok.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="training-requests-heading" className="mt-8">
        <h2 id="training-requests-heading" className="font-display text-lg font-semibold">Eğitim Talepleri</h2>
        <div className="mt-3 space-y-3">
          {individualRequests.map((request) => (
            <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
              <div>
                <p className="font-semibold">
                  {request.education_modules?.title}
                  <span className="text-ink-soft">
                    {" · "}
                    {request.request_type === "bundle" && request.bundle_packages?.title
                      ? request.bundle_packages.title
                      : requestTypeLabels[request.request_type]}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {new Date(request.created_at).toLocaleDateString("tr-TR")}
                  {request.request_type !== "schedule" &&
                    ` · ${request.calculated_price.toLocaleString("tr-TR")}₺`}
                </p>
                {request.request_type === "schedule" && request.user_message && (
                  <p className="mt-1 text-sm text-ink-soft">{request.user_message}</p>
                )}
              </div>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {requestStatusLabels[request.status]}
              </span>
            </div>
          ))}
          {individualRequests.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
              Henüz eğitim talebin yok.{" "}
              <Link href="/panel/kesfet" className="font-semibold text-accent hover:underline">Keşfet</Link>{" "}
              sekmesinden oluşturabilirsin.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
