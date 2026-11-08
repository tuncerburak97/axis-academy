// src/app/(panel)/panel/belgeler/page.tsx — belgelerim: katılım belgeleri ve taleplerden gelen teslim dosyaları
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Download, FileCheck2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyCertificates, getMyDeliverables } from "@/lib/queries/member";
import { formatBytes, formatDate, formatHours } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Accent, PageHeader, SectionHeading } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Belgelerim" };
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await requireUser("/panel/belgeler");
  const [certificates, deliverables] = await Promise.all([getMyCertificates(user.id), getMyDeliverables(user.id)]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={<Accent>Belgelerim</Accent>}
        description="Katılım belgelerin ve ekibimizin sana teslim ettiği dosyalar."
      />

      <section aria-labelledby="sertifikalar" className="flex flex-col gap-4">
        <SectionHeading title={<span id="sertifikalar">Katılım belgeleri</span>} description="Her belgenin bir doğrulama kodu var; özgeçmişinde ya da LinkedIn'de paylaşabilirsin." />
        {certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title="Henüz belgen yok"
            description="Bir eğitim dönemini tamamladığında doğrulama kodlu katılım belgen burada olacak."
            action={
              <Link href="/panel/egitimler" className="text-sm font-semibold text-accent hover:underline">
                Eğitimlerime git
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.map((certificate) => (
              <Link key={certificate.id} href={`/panel/belgeler/${certificate.code}`} className="group block">
                <Card variant="interactive" className="relative flex h-full flex-col gap-5 overflow-hidden">
                  <div aria-hidden className="absolute -right-10 -top-10 size-32 rounded-full border-[14px] border-accent-soft" />
                  <div className="relative flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber">
                      <Award className="size-6" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Katılım belgesi</p>
                      <p className="mt-0.5 font-semibold text-balance group-hover:text-accent">{certificate.program_title}</p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {formatHours(certificate.hours)} · {formatDate(certificate.issued_at)}
                      </p>
                    </div>
                  </div>
                  <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
                    <span className="tabular font-mono text-sm tracking-wide">{certificate.code}</span>
                    {certificate.revoked_at ? (
                      <Badge tone="danger" size="sm">
                        Geçersiz kılındı
                      </Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                        Görüntüle <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="teslimler" className="flex flex-col gap-4">
        <SectionHeading title={<span id="teslimler">Teslim dosyaları</span>} description="Analiz raporları, düzenlenmiş tez dosyaları ve diğer çıktılar." />
        {deliverables.length === 0 ? (
          <Card variant="muted" className="flex items-center gap-3 text-sm text-ink-soft">
            <FileCheck2 className="size-5 shrink-0" aria-hidden />
            Taleplerin tamamlandığında ekibimizin teslim ettiği dosyalar burada da listelenir.
          </Card>
        ) : (
          <Card padding="none">
            <ul className="divide-y divide-line">
              {deliverables.map((file) => (
                <li key={file.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success-ink">
                    <FileCheck2 className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{file.file_name}</p>
                    <p className="truncate text-xs text-ink-soft">
                      <Link href={`/panel/talepler/${file.request_id}`} className="hover:text-ink hover:underline">
                        {file.request_title}
                      </Link>
                      <span className="tabular font-mono"> · {[formatBytes(file.file_size), formatDate(file.created_at)].filter(Boolean).join(" · ")}</span>
                    </p>
                  </div>
                  {file.signed_url && (
                    <a
                      href={file.signed_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-soft hover:bg-surface hover:text-ink"
                      aria-label={`${file.file_name} dosyasını indir`}
                    >
                      <Download className="size-4" aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
