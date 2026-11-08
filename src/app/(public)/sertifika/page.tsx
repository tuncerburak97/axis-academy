// src/app/(public)/sertifika/page.tsx — belge doğrulama: kod girişi (JS gerektirmeyen GET formu → /sertifika/[kod])
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Container, PageHero, Section } from "@/components/public/section";

export const metadata: Metadata = {
  title: "Belge doğrulama",
  description: "Axis Akademi katılım belgesinin geçerliliğini doğrulama kodu ile kontrol et.",
  alternates: { canonical: "/sertifika" },
};

function normalizeCertificateCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export default async function CertificateLookupPage({ searchParams }: { searchParams: Promise<{ kod?: string }> }) {
  const { kod } = await searchParams;
  if (kod && normalizeCertificateCode(kod)) redirect(`/sertifika/${encodeURIComponent(normalizeCertificateCode(kod))}`);

  return (
    <>
      <PageHero
        eyebrow="Belge doğrulama"
        title="Katılım belgesini doğrula"
        description="Belgenin altındaki doğrulama kodunu yaz; belgenin kime, hangi program için ve ne zaman verildiğini gör."
      />
      <Section className="pt-10 sm:pt-14">
        <Container className="max-w-xl">
          <Card padding="lg">
            <form action="/sertifika" method="get" className="flex flex-col gap-5">
              <Field id="kod" label="Doğrulama kodu" hint="Örnek biçim: AX-26-ABC123">
                <Input
                  name="kod"
                  required
                  minLength={6}
                  maxLength={32}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="AX-26-"
                  className="tabular font-mono uppercase tracking-wider"
                />
              </Field>
              <Button type="submit" size="lg">
                <ShieldCheck /> Doğrula
              </Button>
            </form>
          </Card>
          <p className="mt-5 text-center text-sm text-ink-soft">
            Belgeler yalnızca dönemi tamamlayan katılımcılara verilir. Doğrulama sayfası kişisel iletişim bilgisi göstermez.
          </p>
        </Container>
      </Section>
    </>
  );
}
