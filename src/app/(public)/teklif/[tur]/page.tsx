// src/app/(public)/teklif/[tur]/page.tsx — talep sihirbazı: analiz | tez | kurumsal | birebir
// Form herkese açık; yalnızca gönderim için giriş istenir (taslak tarayıcıda saklanır).
// Ön seçim: ?program=<slug>&paket=<id>&mod=custom
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getProgramOptions, getWizardPrograms } from "@/lib/queries/public-catalog";
import { Eyebrow } from "@/components/ui/page-header";
import { Container } from "@/components/public/section";
import { RequestWizard, type WizardKind } from "@/components/public/request-wizard";

const kinds: Record<WizardKind, { title: string; lead: string; eyebrow: string; back: { href: string; label: string } }> = {
  analiz: {
    eyebrow: "Analiz teklifi",
    title: "Analiz ihtiyacını anlat",
    lead: "Birkaç kısa adım. Ekibimiz inceleyip net teklifini panelinde sunar.",
    back: { href: "/analiz", label: "Analiz" },
  },
  tez: {
    eyebrow: "Tez düzenleme teklifi",
    title: "Tezini teslime hazırlayalım",
    lead: "Tezinin temel bilgilerini ver, ne gerektiğini işaretle. Teklif panelinde seni bekler.",
    back: { href: "/tez-duzenleme", label: "Tez düzenleme" },
  },
  kurumsal: {
    eyebrow: "Kurumsal teklif",
    title: "Ekibin için program kuralım",
    lead: "Ekip büyüklüğü, programlar ve format. Kapsam ve fiyat önerimizi panelinde görürsün.",
    back: { href: "/kurumsal", label: "Kurumsal" },
  },
  birebir: {
    eyebrow: "Birebir ders",
    title: "Birebir dersini planla",
    lead: "Hazır bir paket seç ya da konularını kendin belirle; fiyat tahminini anında gör.",
    back: { href: "/programlar", label: "Programlar" },
  },
};

function isKind(value: string): value is WizardKind {
  return value in kinds;
}

type Params = Promise<{ tur: string }>;
type Search = Promise<{ program?: string; paket?: string; mod?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tur } = await params;
  if (!isKind(tur)) return { title: "Talep" };
  return { title: kinds[tur].eyebrow, description: kinds[tur].lead, alternates: { canonical: `/teklif/${tur}` } };
}

export default async function RequestWizardPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const [{ tur }, query] = await Promise.all([params, searchParams]);
  if (!isKind(tur)) notFound();
  const config = kinds[tur];

  const [user, programs, programOptions] = await Promise.all([
    getSessionUser(),
    tur === "birebir" ? getWizardPrograms() : Promise.resolve([]),
    tur === "kurumsal" ? getProgramOptions() : Promise.resolve([]),
  ]);

  const mode = query.mod === "custom" || query.mod === "bundle" || query.mod === "schedule" ? query.mod : undefined;

  return (
    <div className="bg-canvas">
      <Container className="py-8 sm:py-12">
        <nav aria-label="Konum" className="flex items-center gap-1.5 text-sm text-ink-soft">
          <Link href={config.back.href} className="hover:text-ink">
            {config.back.label}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">Teklif</span>
        </nav>
        <header className="mt-5 max-w-2xl">
          <Eyebrow>{config.eyebrow}</Eyebrow>
          <h1 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] text-balance sm:text-[40px]">{config.title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft sm:text-base">{config.lead}</p>
        </header>
        <RequestWizard
          kind={tur}
          loggedIn={Boolean(user)}
          userName={user?.displayName ?? null}
          programs={programs}
          programOptions={programOptions}
          prefill={{ program: query.program, bundleId: query.paket, mode }}
          className="mt-8"
        />
      </Container>
    </div>
  );
}
