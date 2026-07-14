# Public Site Redesign — Tasarım Spec

**Tarih:** 2026-07-14  
**Durum:** Onaylandı

## Amaç

Public tarafta fiyat gösterimini kaldırıp dönüşümü üyeliğe yönlendirmek; ana sayfa ve eğitim detayını görsel olarak zenginleştirmek; Yaklaşan Eğitimler'i ön plana çıkarmak; müfredat detayını popup'a taşımak.

## Kararlar

| Konu | Karar |
|------|-------|
| Müfredat sunumu | Popup/modal (`SyllabusDialog`) |
| Ana sayfa Yaklaşan Eğitimler | Hero'nun hemen altı, tam genişlik |
| Eğitim detay sırası | Hero → Yaklaşan → Özet şerit → Paket kartları → Açıklama |
| Fiyat politikası | Public'te sıfır fiyat; üyeliğe yönlendirme |
| Ana sayfa zenginleştirme | "Kimler için / Ne kazanırsın" görsel blok |
| Yaklaşım | Panel bileşen desenlerini public varyantlarına uyarla |

## Fiyat Politikası

Public'ten kaldırılır: `priceHint`, `public_price_hint`, `fixed_price`, fiyat sidebar, "X saatten başlayan" ifadeleri. Fiyatlar yalnızca üye panelinde görünür.

## Ana Sayfa (`/`)

1. Hero
2. `PublicUpcomingClassesHero` (yeni RPC: tüm modüller)
3. `ValuePropositionSection` (Kimler için / Ne kazanırsın)
4. Hizmet kartları (fiyatsız)
5. TrustStrip, StatBand, Nasıl Çalışır, CTA

## Eğitim Detay (`/egitim/[id]`)

1. Hero (border-b kaldırıldı)
2. `PublicUpcomingSection` (modül-spesifik, zengin kartlar)
3. Özet şerit (spacing düzeltildi, saat aralığı)
4. `BundleCardsSection` (fiyatsız kartlar + Müfredatı Gör)
5. Açıklama + özellikler
6. Nasıl katılırım CTA

Kaldırılır: `BundleComparisonSection`, `BundleComparisonMatrix`, fiyat sidebar.

## Müfredat Popup (`SyllabusDialog`)

Paket sekmeleri + `SyllabusTimeline` + Kayıt CTA. Matris tablosu yok.

## Teknik

### Migration `0012_public_all_upcoming_classes.sql`

- `get_public_all_upcoming_classes()` — anon erişim, max 12 kayıt
- `get_public_upcoming_classes(p_module_id)` — capacity/schedule_note eklendi

### Yeni bileşenler

- `PublicUpcomingClassCard`
- `PublicUpcomingClassesHero`
- `PublicUpcomingSection`
- `ValuePropositionSection`
- `BundleCardsSection`
- `SyllabusDialog`

## Kapsam Dışı

- Admin `public_price_hint` alanı (DB'de kalır)
- Panel/Keşfet değişikliği
- Ayrı müfredat sayfası
