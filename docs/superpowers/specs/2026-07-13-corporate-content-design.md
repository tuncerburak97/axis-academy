# Axis Akademi — Kurumsallaşma & İçerik Zenginleştirme Spesifikasyonu

Tarih: 2026-07-13 · Durum: Onaylandı · Kapsam: seed içerik + eğitim detayı + Hakkımızda

## 1. Hedef

Site büyük bir şirketi temsil eder: her modülün "neyi çözdüğü" madde madde ve veriyle anlatılır; Hakkımızda kurumsal güveni kurar; yeni üye dolu bir katalogla onboard olur.

## 2. Eğitim Seed Script'i (`supabase/seed_education.sql`)

- Migration değil, tek seferlik script; sabit UUID'lerle idempotent yazılır, admin panelden güncellenebilir.
- 3 modül (Excel/Word/PowerPoint): kurumsal uzun açıklama, 10'ar maddelik "neyi çözer" listesi, rozet, fiyat göstergesi.
- Modül başına: 6 konu (tahmini saatli), 3 hazır paket (Başlangıç/Profesyonel/Kurumsal), fiyat planları (bireysel saatlik + 2 grup kademesi), 1 açık sınıf.
- Tüm metinler örnek kurumsal içerik; kullanıcı sonradan düzenler.

## 3. Eğitim Detayı Kurumsallaşması

- Özet veri şeridi: hazır paket sayısı, başlangıç süresi (en kısa paket), kazanım sayısı.
- "Neler Öğreneceksin" → **"Bu eğitim neyi çözer?"**: iki kolonlu, ikonlu kazanım panelleri.

## 4. Hakkımızda — Kurumsal Vitrin

- Anlatı hero'su: eski akademisyen kadro, binlerce saat eğitim, kurumsal şirket deneyimi, yurt içi/dışı panel konuşmacılıkları (+ ekip görseli).
- Animasyonlu sayaç bandı (`StatCounter`, motion): 15+ yıl, 10.000+ katılımcı, 150+ kurum, 40+ panel (örnek değerler).
- Kadro kartları (isimsiz, unvan bazlı), "Neden Axis Akademi" değerler bölümü, kayıt CTA'sı.

## 5. Onboarding Doğrulaması

Kayıt/giriş/Google OAuth/panel yönlendirmesi mevcut ve değişmiyor; onboarding kalitesi seed edilen dolu katalog + net CTA'larla sağlanır.
