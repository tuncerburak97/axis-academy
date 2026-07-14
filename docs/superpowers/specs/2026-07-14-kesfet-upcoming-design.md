# Keşfet Yaklaşan Eğitimler — Tasarım Spec

**Tarih:** 2026-07-14  
**Durum:** Onaylandı, uygulandı

## Amaç

Login sonrası Keşfet ekranında yaklaşan eğitimleri ön plana çıkarmak; kullanıcıyı "eğitim yaklaşıyor, çabuk gel" mesajıyla sisteme dahil etmek.

## Kararlar

| Konu | Karar |
|------|-------|
| Keşfet ana sayfa hero | Tüm modüllerdeki yaklaşan açık sınıflar tek hero bandında |
| Modül detay sırası | Açık Sınıflar → Hazır Paketler → Fiyat Planları → Kendi Modülünü Oluştur |
| Görsel ton | Public site ile aynı dil (gradient, animasyon, tarih rozetleri) |
| Veri yaklaşımı | Yeni `get_member_upcoming_classes()` RPC (Yaklaşım 1) |

## Keşfet Ana Sayfa (`/panel/kesfet`)

- `UpcomingClassesHero` en üstte
- Her kart: tarih rozeti, geri sayım, kontenjan aciliyeti, katılım CTA
- Boş durum: ince motivasyon şeridi
- Altında "Tüm Eğitim Modülleri" grid

## Modül Detay (`/panel/kesfet/[id]`)

- `OpenClassesSection` en üstte (gradient arka plan, zengin kartlar)
- `ScheduleRequestForm` açık sınıflar bölümünde kalır
- Diğer bölümler yeniden sıralandı

## Teknik

### Migration `0011_member_upcoming_classes.sql`

`get_member_upcoming_classes()` — max 12 kayıt, `start_date >= today`, `status = open`, aktif modüller.

### Bileşenler

- `UpcomingClassCard` — paylaşılan kart (hero + detail variant)
- `UpcomingClassesHero` — ana sayfa hero
- `OpenClassesSection` — modül detay üst bölüm
- `daysUntil()` — `src/lib/dates.ts`

### CTA durumları

- Kayıt yok + kontenjan var → Katılım İsteği Gönder
- Kontenjan dolu → disabled
- pending → Onay Bekliyor rozeti
- enrolled/in_progress → Eğitimine Git

## Kapsam Dışı

- Login sonrası otomatik `/panel/kesfet` yönlendirmesi
- Eğitimlerim sayfası teaser
- E-posta/push hatırlatma
