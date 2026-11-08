// src/components/public/site-header.tsx — public üst menü: logo, ana bağlantılar, oturuma göre sağ taraf
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DesktopNav, MobileMenu, UserMenu } from "@/components/public/site-nav";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-semibold tracking-[-0.03em]">Axis</span>{" "}
      <span className="accent-word text-[1.12em] text-accent">Akademi</span>
    </span>
  );
}

export async function SiteHeader() {
  const user = await getSessionUser();
  const viewer = user ? { name: user.displayName, email: user.email, isAdmin: user.role === "admin" } : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0 rounded-md text-lg text-ink" aria-label="Axis Akademi anasayfa">
          <Logo />
        </Link>

        <DesktopNav />

        <div className="flex shrink-0 items-center gap-2">
          {viewer ? (
            <>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href="/panel">Panelim</Link>
              </Button>
              <UserMenu viewer={viewer} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/giris">Giriş</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/kayit">Ücretsiz kayıt ol</Link>
              </Button>
            </>
          )}
          <MobileMenu viewer={viewer} />
        </div>
      </div>
    </header>
  );
}
