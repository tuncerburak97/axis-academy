# Admin Sınıf UX Yenileme — Tasarım Spec

**Tarih:** 2026-07-14 | **Durum:** Onaylandı

## Amaç

`/admin/siniflar` liste ve detay ekranlarını modül UX ile hizalamak; ölçeklenebilir yönetim, öğrenci görünürlüğü ve sınıf duyuruları eklemek.

## Kararlar

| Karar | Seçim |
|-------|--------|
| Liste UX | 2 sekme: Sınıflar + Bekleyen Onaylar |
| Yeni sınıf | `+ Sınıf Aç` popup (modül pattern) |
| Detay UX | 4 sekme: Genel, Öğrenciler, Duyurular, Materyaller |
| Duyuru görünürlüğü | **A** — yalnızca kayıtlı öğrenci paneli |
| Ölçeklenme v1 | Modül/durum filtresi + başlık araması (client-side) |
| Manuel öğrenci ekleme | v2 kapsam dışı |

## Liste (`/admin/siniflar`)

- Kart grid + filtre/arama
- `CreateClassDialog` — alttaki sabit form kaldırılır
- Bekleyen onaylar ayrı sekmede; badge sayısı

## Detay (`/admin/siniflar/[id]`)

| Sekme | İçerik |
|-------|--------|
| Genel | Durum, tarih, kontenjan, hafta override, overview |
| Öğrenciler | profiles join; onay/red; durum rozetleri |
| Duyurular | CRUD popup; title + Markdown body |
| Materyaller | Mevcut kategori CRUD; alt-sekmeler |

## Veri

### `class_announcements`

`id`, `class_id`, `title`, `body`, `created_at`, `updated_at`

RLS: admin CRUD; öğrenci yalnızca kayıtlı olduğu sınıf (`status` ∉ pending/cancelled)

## Panel

`/panel/sinif/[id]` — **Duyurular** sekmesi (kayıtlı öğrenciler)

## Bileşenler

`create-class-dialog`, `class-list-card`, `class-list-tabs`, `class-detail-tabs`, `class-students-panel`, `class-announcements-panel`, `class-materials-panel`, `class-announcements-list` (panel)

## Kapsam dışı

Sayfalama, e-posta bildirimi, manuel öğrenci ekleme/çıkarma
