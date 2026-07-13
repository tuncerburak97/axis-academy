# Admin Modül UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or executing-plans.

**Goal:** Eğitim Yönetimi liste/detay ekranlarını popup + tab + tablo UX ile yenilemek.

**Architecture:** Native dialog wrapper; mevcut Server Action'lar korunur; client tab/panel bileşenleri server sayfalarına veri geçirir.

**Tech Stack:** Next.js 15, Server Actions, native dialog, Tailwind, Lucide

---

### Task 1: Dialog + field modülleri
- [ ] `admin-form-dialog.tsx`
- [ ] `module-catalog-fields.tsx` (PlanFields, BundleFields, CreateModuleFields)

### Task 2: Liste sayfası
- [ ] `create-module-dialog.tsx`, `module-list-card.tsx`
- [ ] `moduller/page.tsx` refactor

### Task 3: Detay sayfası
- [ ] `module-plans-panel.tsx`, `module-bundles-panel.tsx`, `module-detail-tabs.tsx`
- [ ] `moduller/[id]/page.tsx` refactor

### Task 4: Doğrulama
- [ ] `npm run check-types && npm run build`
