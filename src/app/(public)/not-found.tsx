// src/app/(public)/not-found.tsx — public sayfa bulunamadı: kullanıcıyı en olası hedeflere yönlendirir
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accent } from "@/components/ui/page-header";

export default function PublicNotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-canvas px-4 py-20 sm:py-28">
      <div aria-hidden className="bg-grid-light absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_30%,black,transparent)]" />
      <div aria-hidden className="glow-indigo absolute left-1/2 top-0 -z-10 h-[420px] w-[min(760px,140vw)] -translate-x-1/2 opacity-40" />
      <div className="mx-auto max-w-xl text-center">
        <p aria-hidden className="font-serif text-[120px] leading-none tracking-[-0.03em] text-ink sm:text-[160px]">
          4<span className="italic text-accent">0</span>4
        </p>
        <h1 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.035em] text-balance sm:text-[40px]">
          Bu sayfa <Accent>taşınmış</Accent> olabilir
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Aradığın program ya da yazı artık bu adreste değil. Aşağıdaki sayfalardan devam edebilirsin.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/programlar">
              Programlar <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-paper">
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
