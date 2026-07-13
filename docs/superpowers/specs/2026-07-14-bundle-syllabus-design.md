# Paket Bazlı Hibrit Müfredat — Tasarım Spesifikasyonu

Tarih: 2026-07-14 · Durum: Uygulandı

## 1. Amaç

Public eğitim detay sayfasında (`/egitim/[id]`) her örnek paketin (Excel Başlangıç, Profesyonel, Kurumsal vb.) **kendine özgü haftalık akışını** göstermek. Kullanıcı paketler arasındaki farkı net görerek satın alma kararı verebilsin.

## 2. Kararlar

| Karar | Seçim |
|-------|-------|
| Müfredat modeli | **Hibrit (C)** — ortak çekirdek haftalar + pakete özel uzmanlaşma haftaları |
| Public UX | **Sayfa içi paket sekmeleri (A)** — karşılaştırma şeridi + sekmeli timeline |
| Kapsam (v1) | Public vitrin + admin CRUD; panel progress modül müfredatını kullanmaya devam eder |

## 3. Veri Modeli

### `bundle_syllabus_weeks`

| Alan | Tip | Açıklama |
|------|-----|----------|
| `bundle_id` | uuid FK | `bundle_packages.id` |
| `week_number` | int | Paket içi sıra (1..52) |
| `title` | text | Hafta başlığı |
| `description` | text | Hafta açıklaması |
| `week_kind` | `core` \| `specialized` | Ortak temel / pakete özel |
| `source_module_week_id` | uuid? | Modül müfredatından kopya referansı (opsiyonel) |

Modül müfredatı (`module_syllabus_weeks`) ana havuz olarak kalır. Paket müfredatı seed'de modül haftalarından türetilir; admin panelden bağımsız düzenlenebilir.

### Seed yapısı (örnek Excel)

| Paket | Çekirdek | Özel | Toplam |
|-------|----------|------|--------|
| Başlangıç | Hafta 1–4 | — | 4 |
| Profesyonel | Hafta 1–4 | Hafta 5–7 | 7 |
| Kurumsal | Hafta 1–4 | Hafta 5–10 | 10 |

Word ve PowerPoint: çekirdek 1–3, üst paketlerde modül 4–8 arası özel haftalar.

## 4. Public UI

### `BundleComparisonSection`

1. **Karşılaştırma şeridi** — 3 paket kartı: fiyat, saat, hafta sayısı, çekirdek/özel özeti
2. **Sekmeler** — seçili paketin haftalık timeline'ı
3. **Hafta rozeti** — mavi = ortak temel, amber = pakete özel
4. **CTA** — Kayıt Ol + sidebar'dan `#paketleri-karsilastir` anchor

Modül özet şeridi: `X–Y haftalık paketler` metni.

## 5. Admin

- Modül detay → Örnek Paketler → her pakette **Müfredat** dialog
- `BundleSyllabusPanel`: hafta CRUD, `week_kind` seçimi
- Actions: `createBundleSyllabusWeek`, `updateBundleSyllabusWeek`, `deleteBundleSyllabusWeek`

## 6. Dosyalar

```
supabase/migrations/0009_bundle_syllabus.sql
supabase/seed_bundle_syllabus.sql
src/lib/types/catalog.ts — BundleSyllabusWeek, WeekKind
src/lib/queries/catalog.ts — getActiveBundlesWithSyllabus, getModuleBundleSyllabi
src/lib/actions/admin-catalog.ts — bundle syllabus CRUD
src/components/public/bundle-comparison-section.tsx
src/components/public/syllabus-timeline.tsx — week_kind desteği
src/components/admin/bundle-syllabus-panel.tsx
src/app/(public)/egitim/[id]/page.tsx
```

## 7. Supabase Kurulum

```sql
-- 0009_bundle_syllabus.sql
-- seed_syllabus.sql (önkoşul)
-- seed_bundle_syllabus.sql
```

## 8. v2 (Uygulandı)

- **Panel:** `resolveSyllabusForRequest()` — paket talebinde `bundle_id` müfredatı gösterilir
- **Admin:** Modül haftasından pakete tek tıkla kopyala (`copyModuleWeekToBundle`, çekirdek/özel)
- **Public:** `BundleComparisonMatrix` — hafta bazlı karşılaştırma tablosu

## 9. Gelecek (v3)
