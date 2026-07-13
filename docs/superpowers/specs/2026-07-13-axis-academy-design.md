# Axis Akademi — Tasarım Spesifikasyonu (Faz 1)

Tarih: 2026-07-13 · Durum: Onaylandı (mimari ve veri modeli kullanıcı onaylı; görsel dil ve panel kararları kullanıcı yetkisiyle asistan tarafından seçildi)

## 1. Özet

Axis Akademi; Analiz, Eğitim (Excel/Word/PowerPoint) ve Tez Düzenleme hizmetlerini sunan, üç yüzlü bir web uygulaması:

- **Public:** Giriş gerektirmeyen tanıtım + gösterge fiyat. Amaç güven ve kayıt dönüşümü.
- **Üye Paneli:** Kayıtlı kullanıcı aktif eğitimlerini izler, yeni talep oluşturur.
- **Admin:** Tek yetkili admin; içerik, fiyatlandırma, sınıf/grup ve talep yönetimi.

Netleşen kararlar: online ödeme yok; tüm talepler giriş gerektirir; Analiz/Tez formlarında dosya yükleme var; tek admin; sadece Türkçe; MVP'de e-posta = yalnızca Supabase Auth e-postaları; logo yerine geçici tipografik marka.

## 2. Mimari (Onaylı: Yaklaşım A)

Tek Next.js 15 uygulaması (App Router, TS strict), server-first:

- Route grupları: `(public)`, `(panel)/panel`, `(admin)/admin`.
- Okuma: Server Component'lerde doğrudan Supabase. Public sayfalar ISR/revalidate.
- Yazma: Yalnızca Server Actions — `getUser()` → Zod parse → RLS'li mutasyon → `ActionResponse<T>`.
- Yetki katmanları: middleware yalnız session tazeler; layout'lar `getUser()` + rol kontrolü; RLS son savunma.
- Admin girişi `/admin/login`; adminlik `profiles.role='admin'`; admin olmayan `(admin)` altında 404 görür.
- Dizin: `src/app`, `src/components/{ui,public}`, `src/lib/{supabase,actions,queries}`.

## 3. Veri Modeli (Onaylı)

Tablolar: `profiles`, `site_content`, `settings`, `education_modules`, `bundle_packages`, `topics`, `classes` (duration_hours eklendi; enrolled_count yok, sayım enrollments'tan), `class_pricing_tiers` (kişi başı TOPLAM fiyat), `class_enrollments` (UNIQUE(class_id,user_id), kontenjan kontrolü atomik DB fonksiyonu), `individual_requests`, `contact_requests` (dosya: private Storage bucket).

Kurallar:
- RLS her tabloda açık. Anon: yalnız `site_content` + modül tanıtım alanları. Login: katalog tabloları okunur, kullanıcı yalnız kendi talep/kayıtlarını görür. Admin: tam erişim.
- Fiyat: bireysel özel = `settings.hourly_rate × total_hours`, Server Action'da yeniden hesaplanır (istemci fiyatına güvenilmez). Sınıf = kişi sayısı aralığına göre tier tablosu.
- `admin_users` tablosu yok; Supabase Auth + `profiles.role`.

## 4. Görsel Dil — "Aydınlık Editorial"

- Zemin: beyaz `#FFFFFF`, yüzey `#F8F9FB`; metin: lacivert-mürekkep `#0E1A2B`; ikincil metin `#5B6472`.
- Vurgu: indigo `#4F46E5` (birincil aksiyon), amber `#F59E0B` (fiyat/istatistik vurgusu), yeşil `#16A34A` (başarı/durum).
- Tipografi: başlıklar **Sora**, gövde **Inter** (next/font). Ölçek: 4px taban aralık ölçeği, radius `12px` kart / `8px` kontrol.
- His: bol beyaz alan, büyük tipografik hero, yumuşak gölgeli kartlar, hover'da hafif yükselme; dark mode yok; bilgi kirliliği yok.
- Bileşen stratejisi (onaylı: hibrit): public tamamen özel Tailwind bileşenleri; panel + admin shadcn/ui.
- Logo: geçici tipografik "Axis Akademi" işareti; ileride dosya ile değiştirilecek.
- Erişilebilirlik: WCAG 2.1 AA hedefi; görünür focus halkaları, semantik başlık hiyerarşisi, klavye erişimi.

## 5. Public Site

Sayfalar: Anasayfa, Analiz, Eğitim, Tez Düzenleme, Hakkımızda, SSS, İletişim, Giriş, Kayıt.

- Anasayfa: hero (değer önerisi + çift CTA) → 3 hizmet kartı (gösterge fiyatlı) → "Nasıl çalışır" 3 adım → güven bandı → kayıt CTA'sı.
- Eğitim sayfası: modül tanıtımları + `public_price_hint`; aktif sınıf listesi ve detaylı fiyat tablosu GÖSTERİLMEZ; net "kayıt ol, detayları gör" CTA'sı.
- Analiz/Tez: hizmet anlatımı + ortalama fiyat aralığı + "Bize Ulaşın" (girişe yönlendirir).
- İçerik `site_content` tablosundan gelir; admin düzenler; sayfalar revalidate ile tazelenir.

## 6. Üye Paneli

Üst sekmeli sade düzen: **Eğitimlerim / Keşfet / Taleplerim / Hesap**.

- Eğitimlerim: aktif bireysel talepler + sınıf kayıtları; 4 adımlı yatay stepper (talep alındı → planlandı → devam ediyor → tamamlandı); `progress_note` görünür.
- Keşfet: modüller → hazır paketler (sabit fiyat) | kendi modülün (konu çoklu seçim + saat → anlık fiyat) | açık sınıflar (tarih, kalan kontenjan, tier fiyat tablosu, "Katıl").
- Taleplerim: analiz/tez/eğitim geçmişi, durum rozetleri.
- Hesap: ad-soyad, telefon güncelleme.
- Analiz/Tez talep formu: mesaj + isteğe bağlı dosya (private bucket'a yüklenir).

## 7. Admin Paneli

Sol menülü klasik yönetim düzeni (shadcn/ui):

- Dashboard: aktif kullanıcı, aktif sınıf, bekleyen talep sayıları + sınıf doluluk özeti.
- İçerik: `site_content` bölümlerini düzenleme.
- Eğitim: modül / paket / konu havuzu CRUD; `settings.hourly_rate` düzenleme.
- Sınıflar: sınıf oluşturma (tarih, kontenjan, süre), tier fiyat tablosu, kayıtlı kullanıcı görme/çıkarma, durum güncelleme.
- Talepler: analiz + tez + bireysel eğitim tek listede; durum ve not güncelleme.
- Kullanıcılar: liste, doğrulama durumu, kullanıcının eğitimleri.

## 8. Hata Yönetimi ve Test

- Her veri çeken route'ta `loading.tsx` + `error.tsx`; beklenen hatalar `ActionResponse` ile forma bağlı gösterilir (generic toast'a gömülmez).
- Kontenjan yarışı: `enroll_in_class()` Postgres fonksiyonunda kilitli sayım; dolu sınıfta anlaşılır hata.
- Test: fiyat hesabı ve Zod şemaları için birim test; kritik akışlara (kayıt→talep) Faz 1 sonunda Playwright smoke testi.

## 9. Faz 1 Uygulama Sırası

1. İskelet + tasarım token'ları + Supabase şema/RLS
2. Public site (içerik `site_content`'ten)
3. Auth (e-posta+şifre doğrulamalı, Google OAuth) + route koruması
4. Üye paneli (keşfet + talep akışları + eğitimlerim)
5. Admin paneli
6. Cila: mikro-etkileşimler, a11y taraması, smoke testler

Faz 2 (kapsam dışı): sertifika, blog/SEO, referans galerisi, indirim kodu, gelişmiş raporlama, talep durum e-postaları.
