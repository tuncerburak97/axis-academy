# Ana Sayfa — Hizmet Kartları Hero Yerleşimi

**Tarih:** 2026-07-17  
**Durum:** Onaylandı ve uygulandı

## Amaç

"Üç hizmet, tek çatı" bölümünü hero başlığının ("Akademik işlerinizde net, profesyonel ve güvenilir destek") hemen altına taşımak. Diğer bölümler (yaklaşan eğitimler, değer önerisi, trust strip vb.) mevcut sıralarında kalır.

## Kararlar

| Karar | Seçim |
|-------|-------|
| Yaklaşım | Hero içinde yeniden sıralama |
| Hizmet arka planı | `bg-surface` kaldırıldı — hero gradient ile uyum |
| Diğer bölümler | Konum değişmedi |
| Bileşen ayrıştırma | `page.tsx` içinde inline (YAGNI) |

## Yeni hero akışı

```
[2 sütun grid]
  Sol: Rozet + h1 + alt metin + CTA
  Sağ: Hero görseli (md+)
[Üç hizmet, tek çatı + 3 kart grid — tam genişlik, hero grid'in altında]
```

## Sayfa sırası (değişmeyenler)

1. Hero (yeniden düzenlenmiş)
2. Yaklaşan eğitimler
3. Kimler için, ne kazanırsın?
4. TrustStrip → StatBand → Süreç → CTA

## Teknik

- Dosya: `src/app/(public)/page.tsx`
- Eski bağımsız hizmet `<section>` kaldırıldı
- `aria-labelledby="services-heading"` korundu
- Kart animasyonları (`Reveal`, hover) ve responsive grid (`md:grid-cols-3`) aynı

## Test planı

1. 375px: kartlar tek sütun, CTA erişilebilir
2. Desktop: başlık → 3 kart → alt metin/görsel
3. `npm run build` geçer
