# Axis Akademi — Admin Talep/Kullanıcı/İçerik Yönetimi Spesifikasyonu

Tarih: 2026-07-13 · Durum: Onaylandı · Üst dokümanlar: önceki üç spec

## 1. Kapsam

Admin panelinin kalan üç ekranı: Talepler, Kullanıcılar, İçerik (kritik metinler). İçerik kapsamı: anasayfa hero, Analiz/Tez/Eğitim sayfa girişleri, SSS maddeleri.

## 2. Talepler (`/admin/talepler`)

- İki bölüm: **Analiz/Tez** (`contact_requests`) ve **Bireysel Eğitim** (`individual_requests`); satırlar açılır detay.
- Detayda: kullanıcı (ad, e-posta, telefon), mesaj/talep içeriği, varsa dosya için 1 saatlik imzalı indirme linki.
- Güncelleme formu: durum + `admin_notes` (gizli); bireysel eğitimde ayrıca `progress_note` (kullanıcının stepper'ının altında görünür).
- Kaydet → `revalidatePath` ile üye paneli anında tazelenir.

## 3. Kullanıcılar (`/admin/kullanicilar`)

- Tablo: ad-soyad, e-posta, telefon, kayıt tarihi, eğitim talebi sayısı, sınıf kaydı sayısı.
- E-posta `auth.users`'tan sorgulanamadığı için migration 0004 `profiles.email` ekler: `handle_new_user` trigger'ı doldurur, mevcut kayıtlar backfill edilir.

## 4. İçerik (`/admin/icerik`)

- `site_content` bölümleri (page_key/section_key): `home/hero` (başlık, alt metin), `analysis/intro` ve `thesis/intro` (başlık, açıklama, gövde), `education/intro` (başlık, açıklama), `faq/items` (satır başına `Soru::Cevap`).
- Public sayfalar `getContent(page, section, fallback)` ile okur; kayıt yoksa koddaki varsayılan metin kullanılır. Migration 0004 varsayılanları seed'ler.
- Kaydet → ilgili public path'ler revalidate edilir.

## 5. Teknik Notlar

- Tüm mutasyonlar `requireAdmin` + Zod; sonuç `?saved/?error` banner'ı ile.
- İçerik varsayılanları tek dosyada (`src/lib/types/content.ts`) — hem fallback hem admin form başlangıç değeri.
- E-posta doğrulama durumu listede gösterilmiyor (auth şemasında kalıyor); ihtiyaç olursa sonraki iterasyonda service-role ile eklenir.
