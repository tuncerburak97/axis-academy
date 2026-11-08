// src/app/(public)/iletisim/page.tsx — iletişim: giriş gerektirmeyen mesaj formu ve doğru kanala yönlendirme
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, Building2, GraduationCap } from "lucide-react";
import { Eyebrow } from "@/components/ui/page-header";
import { Container, PageHero, Section } from "@/components/public/section";
import { InquiryForm } from "@/components/public/inquiry-form";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Sorunu yaz, e-posta ile yanıtlayalım. Teklif almak istiyorsan doğrudan ilgili formu kullan.",
  alternates: { canonical: "/iletisim" },
};

const shortcuts = [
  { href: "/teklif/analiz", icon: BarChart3, label: "Analiz teklifi" },
  { href: "/teklif/tez", icon: BookOpenCheck, label: "Tez düzenleme teklifi" },
  { href: "/teklif/birebir", icon: GraduationCap, label: "Birebir ders talebi" },
  { href: "/teklif/kurumsal", icon: Building2, label: "Kurumsal eğitim teklifi" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="İletişim"
        title="Bize yaz"
        description="Hesap açmadan soru sorabilirsin; mesajın doğrudan ekibimize düşer, yanıtı e-posta ile göndeririz."
      />
      <Section className="pt-10 sm:pt-14">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <InquiryForm />
          <aside className="flex flex-col gap-6">
            <div>
              <Eyebrow>Teklif mi istiyorsun?</Eyebrow>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Formlar ihtiyacını adım adım sorar; teklifin panelinde yazılı olarak gelir ve süreci oradan izlersin.
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {shortcuts.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex min-h-12 items-center gap-3 rounded-xl border border-line bg-paper px-3.5 text-sm font-semibold transition-colors hover:border-ink-muted"
                    >
                      <item.icon className="size-4 text-accent" aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      <ArrowRight className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-surface p-4 text-sm leading-relaxed text-ink-soft">
              Kayıtlı bir talebin varsa sorunu talep sayfandaki mesajlar bölümünden yazman, yanıtı hızlandırır.{" "}
              <Link href="/panel/talepler" className="font-semibold text-accent hover:underline">
                Taleplerim
              </Link>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
