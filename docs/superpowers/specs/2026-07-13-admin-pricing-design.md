# Axis Akademi — Admin Panel & Dinamik Fiyatlama Spesifikasyonu

Tarih: 2026-07-13 · Durum: Onaylandı (Yaklaşım A) · Üst doküman: `2026-07-13-axis-academy-design.md`

## 1. Kapsam ve Kararlar

- Eğitimler: Excel / Word / PowerPoint. Eğitim biçimleri: **bireysel** (tek kişi), **grup** (sınıf) ve **mevcut eğitime katılım** (grup sınıfına sonradan giriş — **admin onayı şart**).
- Tüm public içerik ve fiyat göstergeleri **admin panelden dinamik** yönetilir; public taraf servis üzerinden okur, sabit metin kalmaz.
- Public eğitim kartları yapılandırılmış alanlarla zenginleşir: başlık, açıklama, fiyat göstergesi, **özellik listesi**, **rozet** (örn. "Popüler").
- Her modülün public **detay sayfası** olur: uzun açıklama + fiyatlama bölümü + **"Örnek Paketleri Gör" popup'ı** (bundle şablonları).
- MVP hedefi; fiyatlama matrisi ileride genişletilebilir yapıda kurulur.

## 2. Veri Modeli Değişiklikleri (migration 0002)

- `education_modules` yeni kolonlar: `long_description text`, `features text[]`, `badge text`.
- **`pricing_plans`** (yeni, birleşik fiyat matrisi):
  `id, module_id, training_type ['individual'|'group'], min_people, max_people, price, unit ['per_hour'|'total'], note, is_active, sort_order`.
  Bireysel saatlik ücret = `training_type='individual', unit='per_hour'` satırı.
- Kaldırılanlar: `class_pricing_tiers` tablosu, `settings.hourly_rate` kaydı.
- `bundle_packages` artık **anon okunabilir** (aktif olanlar) — public popup'ta sergilenen pazarlama içeriği.
- `class_enrollments.status`'a **`pending`** eklenir ve varsayılan olur. Akış:
  kullanıcı katılım isteği (`request_class_enrollment()`, pending) → admin onayı (`approve_class_enrollment()`, kontenjan atomik kontrol, `enrolled`) veya reddi (`cancelled`).
  Eski `enroll_in_class()` kaldırılır.
- RLS: `pricing_plans` üye-okur/admin-yönetir; diğerleri mevcut düzeni korur.

## 3. Admin Panel

- **Eğitimler (`/admin/moduller`):** modül listesi + yeni modül formu. Modül detayında (`/admin/moduller/[id]`) üç bölüm:
  1. Modül bilgileri (başlık, kategori, kısa/uzun açıklama, özellik listesi — satır başına bir madde, rozet, public fiyat göstergesi, aktiflik, sıra)
  2. Fiyat planları matrisi (satır ekle/güncelle/sil)
  3. Örnek paketler (ekle/güncelle/sil)
- **Sınıflar (`/admin/siniflar`):** sınıf oluşturma (modül, başlık, tarih, süre, kontenjan, program notu), sınıf listesi (doluluk: onaylı kayıt sayısı/kontenjan), durum güncelleme ve **bekleyen katılım onayları** kuyruğu (onayla/reddet).
- Tüm mutasyonlar Server Action: admin doğrulaması (`requireAdmin`) → Zod → yazma → `revalidatePath` (public sayfalar anında tazelenir). Ayrı REST endpoint yok; "API call" ihtiyacını server-side servis katmanı karşılar.

## 4. Public Taraf

- `/egitim`: kartlar `education_modules`'ten dinamik (rozet, özellikler, fiyat göstergesi); karttan detaya gidilir.
- `/egitim/[id]`: uzun açıklama, özellik listesi, fiyatlama bölümü (gösterge + "detaylı fiyatlar üyelere" CTA) ve **Örnek Paketler popup'ı** — erişilebilir native `<dialog>` (focus yönetimi, Esc ile kapanış).
- Detaylı fiyat matrisi (`pricing_plans`) yalnız giriş yapmış kullanıcıya (üye Keşfet ekranında kullanılacak).

## 5. Hata Yönetimi / MVP Notları

- Admin formları MVP'de doğrulama hatasında sayfaya `?error` parametresiyle döner ve banner gösterilir; alan bazlı hata mesajları sonraki iterasyonda.
- Kontenjan onayı atomik DB fonksiyonunda; dolu sınıfta onay anlaşılır hatayla reddedilir.
- Üye Keşfet akışı (fiyat hesaplama + talep) bu spec'in devamında ayrı iterasyon.
