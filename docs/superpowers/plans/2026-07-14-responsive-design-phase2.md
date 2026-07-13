# Responsive Design — Faz 2 Implementation Plan

> **Goal:** İlk geçişten kalan mobil UX boşluklarını kapatmak (dokunma hedefleri, fiyat tablosu kartları, hero tipografi, form düzenleri).

**Spec:** `docs/superpowers/specs/2026-07-14-responsive-design-design.md` (Faz 2 eklentisi)

---

### Task 1: Paylaşılan altyapı
- `globals.css`: `.min-touch`, `.prose-table-wrap`, scroll-fade token
- `fields.tsx`: min-h-11 butonlar/inputlar
- `sheet.tsx`, `admin-logout-button.tsx`: kapat/çıkış dokunma hedefi

### Task 2: Panel kritik
- `kesfet/[id]/page.tsx`: fiyat planı mobil kart + desktop tablo
- `custom-module-builder.tsx`, `talepler/page.tsx`: buton/form mobil

### Task 3: Admin formlar
- `siniflar/page.tsx`: durum formu + onay butonları responsive

### Task 4: Public + Auth
- `page.tsx`, `egitim/[id]`, `hakkimizda`, `motion-primitives`: hero tipografi
- `auth-card`, `login-form`, `register-form`, `giris`, `kayit`: padding + min-h-11
- `site-footer`, `packages-dialog`: link/buton hedefleri

### Task 5: İçerik overflow
- `class-materials-tabs.tsx`: prose tablo sarmalayıcı

### Task 6: Doğrulama
- `npm run check-types && npm run build`
