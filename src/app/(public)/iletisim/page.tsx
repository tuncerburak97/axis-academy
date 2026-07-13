// src/app/(public)/iletisim/page.tsx — iletişim: login'siz "bize ulaşın" formu
import type { Metadata } from "next";
import { Mail, Clock3, MessageSquareText } from "lucide-react";
import { PageIntro } from "@/components/public/page-intro";
import { InquiryForm } from "@/components/public/inquiry-form";
import { Reveal } from "@/components/public/motion-primitives";

export const metadata: Metadata = { title: "İletişim" };

const infoItems = [
  {
    icon: MessageSquareText,
    title: "Sorunuzu yazın",
    description: "Analiz, eğitim ya da tez süreçleriyle ilgili her soru için formu kullanabilirsiniz.",
  },
  {
    icon: Mail,
    title: "E-posta ile dönüş",
    description: "Mesajınız doğrudan ekibimize ulaşır; yanıtı bıraktığınız e-posta adresine göndeririz.",
  },
  {
    icon: Clock3,
    title: "Hızlı yanıt",
    description: "Mesajlara genellikle aynı iş günü içinde dönüş yapıyoruz.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Destek"
        title="Bize Ulaşın"
        description="Üye olmadan da soru sorabilirsiniz; mesajınız doğrudan ekibimize düşer."
      />
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <ul className="space-y-6">
            {infoItems.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="rounded-lg bg-accent-soft p-2.5 text-accent">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-xl bg-surface p-4 text-sm text-ink-soft">
            Eğitim talebi, analiz ya da tez süreci başlatmak istiyorsanız{" "}
            <a href="/kayit" className="font-semibold text-accent hover:underline">ücretsiz üye olup</a>{" "}
            panelinizden talep açmanız süreci hızlandırır.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <InquiryForm />
        </Reveal>
      </section>
    </>
  );
}
