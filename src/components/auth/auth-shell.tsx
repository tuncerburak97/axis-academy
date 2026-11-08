// src/components/auth/auth-shell.tsx — giriş/kayıt/şifre sayfalarının ortak iskeleti ve Google butonu
import * as React from "react";
import { Check } from "lucide-react";
import { loginWithGoogle } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

const benefits = [
  "Dönem başvurularını ve bekleme listeni tek yerden izle",
  "Tekliflerini panelinde gör, tek tıkla onayla",
  "Ders bağlantıları, materyaller ve belgelerin hep elinin altında",
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  aside = true,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  aside?: boolean;
}) {
  return (
    <div className="bg-canvas">
      <div className={cn("mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:px-6 sm:py-16", aside && "lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-16")}>
        <div className={cn("w-full min-w-0", !aside && "mx-auto max-w-md")}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">{title}</h1>
          {description && <div className="mt-3 text-[15px] leading-relaxed text-ink-soft">{description}</div>}
          <Card padding="lg" className="mt-8">
            {children}
          </Card>
          {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
        </div>
        {aside && (
          <aside className="hidden min-w-0 lg:block lg:pt-24">
            <div className="rounded-3xl border border-line bg-paper p-8">
              <p className="text-lg font-semibold tracking-tight">
                Bir hesap, <span className="accent-word text-[1.08em] text-accent">her şey</span> tek yerde
              </p>
              <ul className="mt-6 flex flex-col gap-4">
                {benefits.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-t border-line pt-5 text-sm text-ink-soft">Hesap açmak ücretsiz. Ödeme hiçbir zaman site üzerinden alınmaz.</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/** "veya" ayırıcı + Google ile devam (dönüşte ?next korunur) */
export function GoogleSignIn({ next }: { next: string }) {
  return (
    <>
      <div className="my-6 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium text-ink-muted">veya</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <form action={loginWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-line-strong bg-paper px-4 text-sm font-semibold text-ink transition-colors hover:border-ink-muted hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.61 0 3.06.55 4.2 1.64l3.16-3.16A11 11 0 0 0 2.18 7.06L5.84 9.9c.87-2.6 3.3-4.52 6.16-4.52Z" />
          </svg>
          Google ile devam et
        </button>
      </form>
    </>
  );
}
