// src/app/(panel)/panel/belgeler/[code]/page.tsx — yazdırılabilir katılım belgesi (A4 yatay)
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyCertificate } from "@/lib/queries/member";
import { formatDate } from "@/lib/format";
import { Alert } from "@/components/ui/feedback";
import { PrintButton } from "@/components/panel/print-button";

export const metadata: Metadata = { title: "Katılım belgesi" };
export const dynamic = "force-dynamic";

async function siteOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "axisakademi.com";
  const proto = list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const printCss = `
@page { size: A4 landscape; margin: 0; }
@media print {
  html, body { background: #fff !important; }
  .certificate-sheet { width: 297mm !important; height: 210mm !important; max-width: none !important; border-radius: 0 !important; box-shadow: none !important; margin: 0 !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await requireUser(`/panel/belgeler/${code}`);
  const certificate = await getMyCertificate(user.id, decodeURIComponent(code));
  if (!certificate) notFound();
  const verifyUrl = `${await siteOrigin()}/sertifika/${certificate.code}`;
  const verifyLabel = verifyUrl.replace(/^https?:\/\//, "");

  return (
    <div className="flex flex-col gap-6">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <Link href="/panel/belgeler" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Belgelerim
        </Link>
        <div className="flex flex-wrap gap-2">
          <a
            href={verifyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong bg-paper px-4 text-sm font-semibold hover:bg-surface"
          >
            <ShieldCheck className="size-4" aria-hidden /> Doğrulama sayfası
          </a>
          {!certificate.revoked_at && <PrintButton />}
        </div>
      </div>

      {certificate.revoked_at && (
        <Alert tone="danger" title="Bu belge geçersiz kılındı" className="print:hidden">
          {formatDate(certificate.revoked_at)} tarihinde geçersiz kılındı. Bir hata olduğunu düşünüyorsan ekibimize yaz.
        </Alert>
      )}

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 print:m-0 print:overflow-visible print:p-0">
        <article
          aria-label="Katılım belgesi"
          className="certificate-sheet relative mx-auto flex aspect-[297/210] w-full min-w-[640px] max-w-5xl flex-col overflow-hidden rounded-xl bg-paper text-ink shadow-raise"
        >
          {/* Çerçeve */}
          <div aria-hidden className="absolute inset-[2.2%] rounded-[6px] border border-ink/15" />
          <div aria-hidden className="absolute inset-[3.2%] rounded-[4px] border-2 border-ink" />
          <div aria-hidden className="absolute -right-[12%] -top-[22%] aspect-square w-[42%] rounded-full bg-accent-soft" />
          <div aria-hidden className="absolute -bottom-[30%] -left-[10%] aspect-square w-[38%] rounded-full bg-amber-soft/70" />

          <div className="relative flex flex-1 flex-col px-[9%] pb-[7%] pt-[8%]">
            <div className="flex items-start justify-between">
              <p className="text-[clamp(14px,2vw,20px)] font-semibold tracking-tight">
                Axis <span className="accent-word text-[1.15em] text-accent">Akademi</span>
              </p>
              <p className="tabular text-right font-mono text-[clamp(9px,1.1vw,12px)] uppercase tracking-[0.12em] text-ink-soft">
                Belge no
                <br />
                <span className="text-ink">{certificate.code}</span>
              </p>
            </div>

            <div className="mt-[5%] flex flex-1 flex-col items-center text-center">
              <p className="text-[clamp(10px,1.2vw,13px)] font-semibold uppercase tracking-[0.32em] text-ink-soft">Katılım belgesi</p>
              <p className="mt-[3%] text-[clamp(11px,1.3vw,15px)] text-ink-soft">Bu belge,</p>
              <p className="accent-word mt-[1.5%] text-[clamp(34px,6vw,68px)] leading-none text-ink">{certificate.recipient_name}</p>
              <div aria-hidden className="mt-[2.5%] h-px w-[46%] bg-ink/20" />
              <p className="mt-[3%] max-w-[78%] text-[clamp(11px,1.4vw,16px)] leading-relaxed text-ink-soft">
                Axis Akademi tarafından düzenlenen
                <br />
                <span className="text-[clamp(15px,2.2vw,26px)] font-semibold leading-snug tracking-tight text-ink">{certificate.program_title}</span>
                <br />
                eğitimini{certificate.hours ? (
                  <>
                    {" "}
                    <span className="tabular font-mono text-ink">{certificate.hours}</span> saat süreyle
                  </>
                ) : null}{" "}
                başarıyla tamamladığını belgeler.
              </p>
            </div>

            <div className="mt-auto grid grid-cols-3 items-end gap-6 text-[clamp(9px,1.1vw,12px)]">
              <div>
                <p className="tabular font-mono text-[1.15em] text-ink">{formatDate(certificate.issued_at)}</p>
                <div aria-hidden className="my-1.5 h-px bg-ink/25" />
                <p className="uppercase tracking-[0.12em] text-ink-soft">Veriliş tarihi</p>
              </div>
              <div className="flex justify-center">
                <span className="flex aspect-square w-[42%] min-w-14 max-w-24 flex-col items-center justify-center rounded-full bg-ink text-center text-white">
                  <span className="accent-word text-[1.6em] leading-none text-amber">A</span>
                  <span className="mt-0.5 text-[0.7em] font-semibold uppercase tracking-[0.18em] text-white/80">Onaylı</span>
                </span>
              </div>
              <div className="text-right">
                <p className="break-all font-mono text-[1.05em] text-ink">{verifyLabel}</p>
                <div aria-hidden className="my-1.5 h-px bg-ink/25" />
                <p className="uppercase tracking-[0.12em] text-ink-soft">Doğrulama adresi</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <p className="text-center text-xs text-ink-soft print:hidden">
        İpucu: Yazdırma penceresinde hedef olarak “PDF olarak kaydet”i seçip belgeyi dosya olarak indirebilirsin.
      </p>
    </div>
  );
}
