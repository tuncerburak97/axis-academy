# Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tüm ekranları (public, panel, admin) 390px+ mobil cihazlarda tam kullanılabilir hale getirmek.

**Architecture:** shadcn/ui Sheet ile sol drawer mobil navigasyon; admin ve public için paylaşılan desen; panel sekmeleri scroll iyileştirmesi; sayfa düzeyinde kart/tab responsive dönüşümleri.

**Tech Stack:** Next.js 15, Tailwind v4, shadcn/ui (Sheet, Button, Separator), Radix UI, Lucide React

**Spec:** `docs/superpowers/specs/2026-07-14-responsive-design-design.md`

---

### Task 1: shadcn altyapısı

**Files:**
- Modify: `package.json`
- Create: `components.json`, `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`, `sheet.tsx`, `separator.tsx`

- [ ] Bağımlılıkları ekle ve `cn()` yardımcısını oluştur
- [ ] Sheet, Button, Separator bileşenlerini ekle

### Task 2: Admin mobil shell

**Files:**
- Create: `src/components/admin/admin-shell.tsx`, `admin-logout-button.tsx`
- Modify: `src/components/admin/admin-nav.tsx`, `src/app/(admin)/admin/(dashboard)/layout.tsx`

- [ ] AdminShell: desktop sidebar + mobil üst bar + Sheet drawer
- [ ] AdminNav'a `onNavigate` callback ekle
- [ ] Layout'u AdminShell kullanacak şekilde güncelle

### Task 3: Public mobil menü

**Files:**
- Create: `src/lib/navigation.ts`, `src/components/public/mobile-site-menu.tsx`
- Modify: `src/components/public/site-header.tsx`

- [ ] navLinks'i paylaşılan sabite taşı
- [ ] Hamburger + Sheet menü ekle

### Task 4: Panel iyileştirmeleri

**Files:**
- Modify: `src/components/panel/panel-tabs.tsx`, `progress-stepper.tsx`, `src/app/(panel)/panel/layout.tsx`

- [ ] PanelTabs scroll-snap + fade gradient
- [ ] ProgressStepper kompakt mobil varyant
- [ ] Panel header mobil kullanıcı adı

### Task 5: Sayfa audit

**Files:**
- Modify: `kullanicilar/page.tsx`, `page-intro.tsx`, `class-materials-tabs.tsx`, `globals.css`

- [ ] Kullanıcılar: mobil kart + desktop tablo
- [ ] PageIntro responsive tipografi
- [ ] globals.css scroll yardımcıları

### Task 6: Doğrulama

- [ ] `npm run check-types`
- [ ] `npm run build`
