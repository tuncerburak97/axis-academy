# Axis Akademi — Dinamik Eğitimler, Doküman Yönetimi & Bildirimler Spesifikasyonu

Tarih: 2026-07-13 · Durum: Onaylandı

## 1. E-posta Bildirimleri

- Resend REST API ile (paketsiz, `fetch`); env: `RESEND_API_KEY`, `ADMIN_EMAIL`, `EMAIL_FROM`.
- Tetikleyenler: analiz/tez talebi, paket/özel/tarih eğitim talebi, sınıf katılım isteği, public "bize ulaşın" mesajı.
- Key tanımlı değilse mail atlanır, akış asla bozulmaz (hata loglanır).

## 2. Bize Ulaşın (Public)

- İletişim sayfası login'siz form: ad, e-posta, mesaj + honeypot alanı.
- Yeni `public_inquiries` tablosu (anon insert; admin okur/günceller; durumlar: new/answered/closed).
- Admin Dashboard'a "Yanıt Bekleyen Soru" kartı; Talepler ekranına üçüncü bölüm.

## 3. Dinamik Eğitimler + Doküman Yönetimi

- Modüller sabit; `classes` genişler: `duration_weeks`, `overview` (genel içerik metni).
- Yeni `class_materials`: kategori `general|weekly|homework|note`, hafta no, başlık, **Markdown içerik** (react-markdown render) ve/veya dosya (`class-materials` private bucket, yol `{class_id}/{dosya}`).
- RLS + storage politikası: yalnız onaylı kayıtlı kullanıcı (pending/cancelled hariç) ve admin erişir.
- Admin `/admin/siniflar/[id]`: eğitim bilgileri (genel içerik, hafta sayısı) + materyal CRUD (dosya yükleme dahil).
- Üye `/panel/sinif/[id]`: tab'lı görünüm (Genel / Haftalık Ders / Ödevler / Notlar), MD render, imzalı dosya linkleri. Eğitimlerim kartlarından erişilir.

## 4. Tarih Talebi

- `individual_requests.request_type`'a `schedule` eklenir + `user_message` kolonu.
- Üye modül detayında açık sınıfların altında "uygun tarih yok mu?" formu: mesajla talep açılır (fiyat 0, admin manuel işler).
- Talep tipi etiketleri: Hazır Paket / Özel Modül / Tarih Talebi.

## 5. Public Anlatım

- Public modül detayına "Yaklaşan Eğitimler" tarih şeridi (SECURITY DEFINER `get_public_upcoming_classes`: yalnız başlık/tarih/süre — kişisel veri yok) ve 3 adımlı katılım akışı bölümü (agresif görsel dil).

## 6. Diğer

- Seed: mevcut sınıflara hafta/overview + 3 yeni yaklaşan eğitim + örnek haftalık MD materyalleri.
- `loading.tsx`/`error.tsx`: panel, admin ve kök seviye.
- Yeni bağımlılık: `react-markdown`.
