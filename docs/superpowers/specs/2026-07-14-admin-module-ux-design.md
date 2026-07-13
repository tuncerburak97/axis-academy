# Admin Modül UX Yenileme — Tasarım Spec

**Tarih:** 2026-07-14 | **Durum:** Onaylandı

## Amaç

Eğitim Yönetimi (`/admin/moduller`) liste ve detay ekranlarını daha şık, net ve işlevsel hâle getirmek.

## Kararlar

- Popup: ortalanmış native `<dialog>` (ConfirmDeleteButton pattern)
- Plan/paket düzenleme: tablo + düzenle popup (B)
- Tab persistence: URL yok, client `useState`

## Liste (`/admin/moduller`)

- Alttaki sabit form kaldırılır
- Sağ üst: `+ Modül Ekle` → modal (`createModule`)
- Kartlar: tamamı link değil; `Detaya Git →` + `Sil` (ConfirmDeleteButton)
- Silme detay sayfasından kaldırılır

## Detay (`/admin/moduller/[id]`)

3 tab: **Genel Görünüm** | **Fiyat Planları (n)** | **Örnek Paketler (n)**

- Genel: mevcut `updateModule` formu
- Fiyat: tablo + `+ Yeni Fiyat Ekle` popup + satır Düzenle popup + Sil
- Paket: aynı pattern

## Bileşenler

`admin-form-dialog`, `create-module-dialog`, `module-list-card`, `module-detail-tabs`, `module-plans-panel`, `module-bundles-panel`, `module-catalog-fields`

## Kapsam dışı

URL tab, toplu silme, drag-drop sıralama
