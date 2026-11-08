// src/app/(public)/not-found.tsx — public sayfa bulunamadı: kullanıcıyı en olası hedeflere yönlendirir
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accent, Eyebrow } from "@/components/ui/page-header";

export default function PublicNotFound() {
  return (
    <section className="bg-canvas px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-xl text-center">
        <Eyebrow className="tabular font-mono">404</Eyebrow>
        <h1 className="mt-4 text-[34px] font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
          Bu sayfa <Accent>taşınmış</Accent> olabilir
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Aradığın program ya da yazı artık bu adreste değil. Aşağıdaki sayfalardan devam edebilirsin.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/programlar">Programlar</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Anasayfa</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/iletisim">Bize yaz</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
