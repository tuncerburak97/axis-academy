# Admin Nav Aktif Talep Rozeti Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin sol menüsündeki Talepler öğesinde, tamamlanmamış/kapatılmamış talep sayısını `Inbox` ikonu üzerinde dairesel rozet olarak göstermek.

**Architecture:** `getActiveRequestCount()` server query fonksiyonu üç Supabase count sorgusunu paralel çalıştırır; `AdminLayout` (RSC) sonucu `AdminNav` (client) prop'una geçirir. Rozet yalnızca count > 0 iken render edilir.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase SSR (`@/lib/supabase/server`), Tailwind CSS, Lucide React

**Spec:** `docs/superpowers/specs/2026-07-13-admin-nav-active-request-badge-design.md`

---

## Dosya Haritası

| Dosya | Sorumluluk |
|---|---|
| `src/lib/queries/admin-requests.ts` | Aktif talep sayımı (tek kaynak) |
| `src/app/(admin)/admin/(dashboard)/layout.tsx` | Sayımı fetch edip nav'a prop geçirme |
| `src/components/admin/admin-nav.tsx` | Rozet UI + erişilebilirlik |

---

### Task 1: Aktif talep sayım fonksiyonu

**Files:**
- Create: `src/lib/queries/admin-requests.ts`

- [ ] **Step 1: Query dosyasını oluştur**

```typescript
// src/lib/queries/admin-requests.ts — admin paneli talep sayım sorguları
import { createClient } from "@/lib/supabase/server";

const ACTIVE_CONTACT_STATUSES = ["new", "contacted", "in_progress"] as const;
const ACTIVE_INDIVIDUAL_STATUSES = ["received", "planned", "in_progress"] as const;
const ACTIVE_INQUIRY_STATUSES = ["new", "answered"] as const;

export async function getActiveRequestCount(): Promise<number> {
  const supabase = await createClient();

  const [contactResult, individualResult, inquiryResult] = await Promise.all([
    supabase
      .from("contact_requests")
      .select("*", { count: "exact", head: true })
      .in("status", [...ACTIVE_CONTACT_STATUSES]),
    supabase
      .from("individual_requests")
      .select("*", { count: "exact", head: true })
      .in("status", [...ACTIVE_INDIVIDUAL_STATUSES]),
    supabase
      .from("public_inquiries")
      .select("*", { count: "exact", head: true })
      .in("status", [...ACTIVE_INQUIRY_STATUSES]),
  ]);

  if (contactResult.error || individualResult.error || inquiryResult.error) return 0;

  return (
    (contactResult.count ?? 0) +
    (individualResult.count ?? 0) +
    (inquiryResult.count ?? 0)
  );
}
```

- [ ] **Step 2: Tip kontrolü çalıştır**

Run: `npm run check-types`
Expected: PASS (sıfır hata)

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries/admin-requests.ts
git commit -m "feat(admin): aktif talep sayım sorgusu ekle"
```

---

### Task 2: Admin layout'a sayım entegrasyonu

**Files:**
- Modify: `src/app/(admin)/admin/(dashboard)/layout.tsx`

- [ ] **Step 1: Import ve fetch ekle**

`layout.tsx` dosyasında import satırına ekle:

```typescript
import { getActiveRequestCount } from "@/lib/queries/admin-requests";
```

Admin guard bloğundan sonra, `return` öncesine ekle:

```typescript
  const activeRequestCount = await getActiveRequestCount();
```

`<AdminNav />` satırını şununla değiştir:

```tsx
          <AdminNav activeRequestCount={activeRequestCount} />
```

Tam dosya şöyle görünmeli:

```typescript
// src/app/(admin)/admin/(dashboard)/layout.tsx — admin koruması: admin olmayan herkes 404 görür
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { getActiveRequestCount } from "@/lib/queries/admin-requests";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "admin") notFound();

  const activeRequestCount = await getActiveRequestCount();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white p-4 md:flex">
        <Link href="/admin" className="px-3 py-2 font-display text-lg font-bold tracking-tight">
          Axis<span className="text-accent"> Admin</span>
        </Link>
        <div className="mt-4 flex-1">
          <AdminNav activeRequestCount={activeRequestCount} />
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface"
          >
            Çıkış Yap
          </button>
        </form>
      </aside>
      <main className="flex-1 bg-surface px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Tip kontrolü çalıştır**

Run: `npm run check-types`
Expected: FAIL — `AdminNav` henüz `activeRequestCount` prop'unu kabul etmiyor (Task 3'te düzelecek)

- [ ] **Step 3: Commit** (Task 3 ile birlikte veya Task 3 sonrası)

---

### Task 3: AdminNav rozet UI

**Files:**
- Modify: `src/components/admin/admin-nav.tsx`

- [ ] **Step 1: Prop arayüzü ve yardımcı fonksiyon ekle**

Dosyanın tamamını şununla değiştir:

```typescript
// src/components/admin/admin-nav.tsx — admin sol menüsü (aktif bağlantı vurgulu + talep rozeti)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  Inbox,
  School,
  type LucideIcon,
} from "lucide-react";

interface AdminNavProps {
  activeRequestCount: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/icerik", label: "İçerik", icon: FileText },
  { href: "/admin/moduller", label: "Eğitimler", icon: BookOpen },
  { href: "/admin/siniflar", label: "Sınıflar", icon: School },
  { href: "/admin/talepler", label: "Talepler", icon: Inbox },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
];

function formatBadgeCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

export function AdminNav({ activeRequestCount }: AdminNavProps) {
  const pathname = usePathname();
  const showRequestBadge = activeRequestCount > 0;

  return (
    <nav aria-label="Yönetim menüsü" className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const isRequestsItem = item.href === "/admin/talepler";
        const ariaLabel =
          isRequestsItem && showRequestBadge
            ? `Talepler, ${activeRequestCount} aktif talep`
            : undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={ariaLabel}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface hover:text-ink"
            }`}
          >
            <span className="relative shrink-0">
              <item.icon className="size-4.5" aria-hidden />
              {isRequestsItem && showRequestBadge && (
                <span
                  aria-hidden
                  className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-amber-soft px-1 text-[10px] font-bold leading-none text-ink"
                >
                  {formatBadgeCount(activeRequestCount)}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Tip kontrolü çalıştır**

Run: `npm run check-types`
Expected: PASS

- [ ] **Step 3: Build doğrulaması**

Run: `npm run build`
Expected: PASS (admin layout ve nav derlenir)

- [ ] **Step 4: Commit**

```bash
git add src/app/(admin)/admin/(dashboard)/layout.tsx src/components/admin/admin-nav.tsx
git commit -m "feat(admin): talepler menüsüne aktif talep rozeti ekle"
```

---

### Task 4: Manuel doğrulama

**Files:** Yok (tarayıcı testi)

- [ ] **Step 1: Dev sunucuyu başlat**

Run: `npm run dev`
Expected: Sunucu `http://localhost:3000` üzerinde çalışır

- [ ] **Step 2: Aktif talep varken rozet kontrolü**

1. Admin olarak giriş yap (`/admin/login`)
2. Herhangi bir admin sayfasında sol menüye bak
3. Veritabanında aktif durumda talep varsa Talepler ikonunda amber rozet görünmeli
4. Rozetteki sayı = contact (new/contacted/in_progress) + individual (received/planned/in_progress) + inquiry (new/answered) toplamı

- [ ] **Step 3: Sıfır durumu kontrolü**

1. Tüm aktif talepleri tamamla/kapat (veya test verisi olmayan ortamda doğrula)
2. Sayfayı yenile
3. Rozet görünmemeli

- [ ] **Step 4: Güncelleme sonrası revalidate kontrolü**

1. `/admin/talepler` sayfasında bir talebin durumunu `completed` veya `closed` yap, kaydet
2. Yönlendirme sonrası nav rozetinin azaldığını veya kaybolduğunu doğrula

- [ ] **Step 5: Erişilebilirlik kontrolü**

1. Tarayıcı geliştirici araçlarında Talepler linkinin `aria-label="Talepler, N aktif talep"` attribute'unu doğrula (N > 0 iken)

---

## Spec Coverage Kontrolü

| Spec maddesi | Task |
|---|---|
| C kapsamı aktif durumlar | Task 1 |
| Server-side count + layout prop | Task 1, 2 |
| Rozet UI (ikon üstü, amber) | Task 3 |
| Sıfırda gizle | Task 3 (`showRequestBadge`) |
| 99+ kısaltması | Task 3 (`formatBadgeCount`) |
| aria-label | Task 3 |
| Hata → 0 döner | Task 1 |
| revalidatePath (mevcut) | Değişiklik gerekmez — Task 4 Step 4 ile doğrula |
| Kapsam dışı maddeler | Plan'da yok ✓ |
