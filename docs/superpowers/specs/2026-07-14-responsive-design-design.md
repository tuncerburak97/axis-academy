# Responsive Design — Tasarım Spec

**Tarih:** 2026-07-14  
**Durum:** Onaylandı (kullanıcı execute talebi)

## Amaç

Tüm ekranların (public, panel, admin) 390px+ mobil cihazlarda tam kullanılabilir olması. Admin sidebar ve public ana menünün mobilde erişilebilir hale getirilmesi.

## Kararlar

| Karar | Seçim |
|-------|-------|
| Mobil nav deseni | Sol drawer (hamburger) |
| Altyapı | shadcn/ui Sheet (Radix) |
| Kapsam | Tam audit (public + panel + admin) |
| Min viewport | 390px |
| Panel sekmeleri | Yatay scroll korunur + scroll ipucu |

## Mimari

### Paylaşılan altyapı
- `src/lib/utils.ts` — `cn()` yardımcısı
- `src/components/ui/sheet.tsx`, `button.tsx`, `separator.tsx`
- `src/lib/navigation.ts` — public nav link sabitleri

### Admin (`AdminShell`)
- `≥ md`: mevcut sabit sidebar
- `< md`: sticky üst bar (logo + hamburger) + Sheet drawer (AdminNav + çıkış)
- Route değişince drawer kapanır

### Public (`MobileSiteMenu`)
- `≥ md`: mevcut yatay nav
- `< md`: hamburger → Sheet (nav linkleri + giriş/kayıt)

### Panel
- `PanelTabs`: scroll-snap, fade gradient, min dokunma hedefi
- `ProgressStepper`: `< sm` kompakt dikey varyant
- Header: mobilde kısaltılmış kullanıcı adı

### Sayfa düzeltmeleri
- `kullanicilar`: mobil kart görünümü + desktop tablo
- `page-intro`: `text-3xl sm:text-4xl` başlık
- `globals.css`: `.scroll-fade-x`, `.min-touch` yardımcıları
- `class-materials-tabs`: scroll fade + snap

### Faz 2 (2026-07-14)
- `kesfet/[id]`: fiyat planı mobil kart görünümü
- `fields.tsx`: tüm admin formlarında `min-h-11` dokunma hedefi
- `globals.css`: `.prose-table-wrap` markdown tablo overflow
- Public hero tipografi (`page.tsx`, `egitim/[id]`, `hakkimizda`)
- Admin `siniflar`: mobil form düzeni
- Auth sayfaları: `py-12 sm:py-20`, buton yükseklikleri

## Erişilebilirlik

- Sheet: Radix odak tuzağı, ESC, `aria-expanded`
- Nav linkleri: `aria-current="page"`
- Min dokunma hedefi: 44px
- `:focus-visible` mevcut token ile korunur

## Test planı

1. 390px genişlikte admin login → tüm menü öğelerine erişim
2. Public header hamburger → 6 sayfa linki
3. Panel sekmeleri kaydırılabilir ve aktif sekme görünür
4. Kullanıcılar sayfası mobilde kart, desktop tablo
5. `npm run build` ve `npm run check-types` geçer
