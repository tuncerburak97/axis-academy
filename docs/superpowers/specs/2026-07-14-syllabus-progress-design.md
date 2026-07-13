# Haftalık Müfredat & Progress UX — Tasarım Spec

**Tarih:** 2026-07-14 | **Durum:** Onaylandı

## Amaç

Modül bazlı haftalık müfredat + sınıf progress deneyimi. Public vitrin, admin CRUD, panel wow UX.

## Kararlar

- Müfredat: modül seviyesi (`module_syllabus_weeks`)
- Progress: karma — `start_date` otomatik + `current_week_override`
- Materyal bağlantısı: mevcut `class_materials.week_number`

## Veri

`module_syllabus_weeks(module_id, week_number, title, description, sort_order)`

`classes.current_week_override int null`

`effectiveWeek = override ?? clamp(autoWeek, 1, duration_weeks)`

## Admin

- Modül detay 4. tab: Müfredat (tablo + popup CRUD)
- Modül aktif için en az 1 hafta zorunlu
- Sınıf içerik: güncel hafta override

## Public

- `/egitim/[id]`: Haftalık Müfredat timeline (tüm haftalar görünür)

## Panel `/panel/sinif/[id]`

4 tab: İlerleme | Müfredat | Dersler | Ödevler

- İlerleme hero: hafta X/Y, % bar, istatistik kartları
- Hafta durumu: tamamlandı / güncel / gelecek

## Seed

Excel Veri Ustalığı: 10 hafta başlangıç müfredatı

## Kapsam dışı

Bireysel talep detay sayfası (sonraki iterasyon)
