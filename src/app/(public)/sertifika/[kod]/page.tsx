// src/app/(public)/sertifika/[kod]/page.tsx — katılım belgesi doğrulama sonucu: geçerli / iptal edilmiş / bulunamadı
import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, SearchX, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/field";
import { Eyebrow } from "@/components/ui/page-header";
import { Container, Section } from "@/components/public/section";

type Params = Promise<{ kod: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { kod } = await params;
  return { title: `Belge doğrulama · ${decodeURIComponent(kod).toUpperCase()}`, robots: { index: false, follow: false } };
}

export default async function CertificateVerifyPage({ params }: { params: Params }) {
  const { kod } = await params;
  const code = decodeURIComponent(kod).trim().toUpperCase().slice(0, 40);
  const supabase = await createClient();
  const { data } = await supabase.rpc("verify_certificate", { p_code: code });
  const certificate = data?.[0] ?? null;

  return (
    <div className="bg-canvas">
      <Section className="py-12 sm:py-20">
        <Container className="max-w-2xl">
          <Eyebrow>Belge doğrulama</Eyebrow>
          <p className="tabular mt-2 font-mono text-sm text-ink-soft">{code}</p>

          {!certificate ? (
            <div className="mt-6 flex flex-col gap-6">
              <EmptyState
                icon={SearchX}
                title="Bu koda ait bir belge bulunamadı"
                description="Kodu belgedeki gibi, tireleriyle birlikte yazdığından emin ol. Örnek biçim: AX-26-ABC123."
              />
              <Card>
                <form action="/sertifika" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Field id="kod" label="Kodu yeniden yaz" className="flex-1">
                    <Input name="kod" required defaultValue={code} maxLength={32} autoComplete="off" spellCheck={false} className="tabular font-mono uppercase tracking-wider" />
                  </Field>
                  <Button type="submit">Tekrar dene</Button>
                </form>
              </Card>
            </div>
          ) : (
            <Card padding="none" className="mt-6 overflow-hidden shadow-raise">
              <div
                className={
                  certificate.revoked
                    ? "flex items-center gap-3 bg-danger-soft px-6 py-4 text-danger-ink"
                    : "flex items-center gap-3 bg-success-soft px-6 py-4 text-success-ink"
                }
              >
                {certificate.revoked ? <ShieldAlert className="size-5 shrink-0" aria-hidden /> : <BadgeCheck className="size-5 shrink-0" aria-hidden />}
                <p className="font-semibold">
                  {certificate.revoked ? "Bu belge iptal edilmiş, geçerli değil." : "Bu belge geçerli ve Axis Akademi tarafından verilmiştir."}
                </p>
              </div>
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                <p className="text-sm text-ink-soft">Katılım belgesi</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl">{certificate.recipient_name}</h1>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{certificate.program_title}</span> programını tamamlamıştır.
                </p>
                <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
                  <div className="bg-paper px-4 py-3">
                    <dt className="text-xs text-ink-soft">Veriliş tarihi</dt>
                    <dd className="tabular mt-1 font-mono text-sm">{formatDate(certificate.issued_at)}</dd>
                  </div>
                  <div className="bg-paper px-4 py-3">
                    <dt className="text-xs text-ink-soft">Süre</dt>
                    <dd className="tabular mt-1 font-mono text-sm">{certificate.hours ? `${certificate.hours} saat` : "—"}</dd>
                  </div>
                  <div className="col-span-2 bg-paper px-4 py-3 sm:col-span-1">
                    <dt className="text-xs text-ink-soft">Durum</dt>
                    <dd className="mt-1">
                      <Badge tone={certificate.revoked ? "danger" : "success"} dot size="sm">
                        {certificate.revoked ? "İptal edildi" : "Geçerli"}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          )}

          <p className="mt-8 text-center text-sm text-ink-soft">
            Başka bir belge mi?{" "}
            <Link href="/sertifika" className="font-semibold text-accent hover:underline">
              Yeni kod doğrula
            </Link>
          </p>
        </Container>
      </Section>
    </div>
  );
}
