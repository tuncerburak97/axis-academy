# Axis Akademi — Üye Paneli (Keşfet & Talepler) Spesifikasyonu

Tarih: 2026-07-13 · Durum: Onaylandı (Yaklaşım A) · Üst dokümanlar: `2026-07-13-axis-academy-design.md`, `2026-07-13-admin-pricing-design.md`

## 1. Kapsam

Üye panelinin tamamı gerçek veriye bağlanır: Keşfet (eğitim talepleri), Analiz/Tez talep formu (dosya yüklemeli), Eğitimlerim (ilerleme stepper'lı), Taleplerim (geçmiş) ve Hesap (profil güncelleme).

## 2. Keşfet

- `/panel/kesfet`: aktif modül kartları → `/panel/kesfet/[id]` modül detayı, dört blok:
  1. **Fiyat planları matrisi** — `pricing_plans` (üyeye açık tam liste).
  2. **Hazır paketler** — tek tıkla talep; sunucu fiyatı paketin `fixed_price` değerinden alır.
  3. **Kendi modülünü oluştur** — konu çoklu seçimi; seçilen konuların `estimated_hours` toplamı saat alanına otomatik yazılır, kullanıcı değiştirebilir; canlı fiyat = bireysel saatlik plan × saat. Sunucu fiyatı her zaman yeniden hesaplar; modülde aktif bireysel saatlik plan yoksa anlaşılır hata.
  4. **Açık sınıflar** — tarih, kalan kontenjan, grup fiyatları; "Katılım İsteği Gönder" → `request_class_enrollment()` (pending, admin onayı bekler). Kullanıcının mevcut isteği varsa buton pasif ve durumu gösterilir.
- Kontenjan sayımı RLS nedeniyle istemciden yapılamaz → `get_open_classes(module_id)` SECURITY DEFINER fonksiyonu (migration 0003) sınıf + onaylı kayıt sayısı + kullanıcının kendi durumunu döner.

## 3. Analiz / Tez Talebi

- `/panel/talepler/yeni`: hizmet türü (analiz|tez) + mesaj + isteğe bağlı dosya.
- Dosya: private `request-files` bucket, yol `{user_id}/{uuid}-{ad}`, max 10MB; hata forma bağlı gösterilir.

## 4. Eğitimlerim ve Taleplerim

- **Eğitimlerim (`/panel`):** aktif bireysel talepler (received/planned/in_progress) + sınıf kayıtları (pending/enrolled/in_progress). Her kartta 4 adımlı stepper (Talep Alındı → Planlandı → Devam Ediyor → Tamamlandı; sınıfta Onay Bekliyor → Kayıtlı → Devam Ediyor → Tamamlandı) ve admin'in `progress_note`'u.
- **Taleplerim (`/panel/talepler`):** tüm bireysel + analiz/tez talepleri durum rozetleriyle; "Yeni Talep" butonu.

## 5. Hesap

- Ad-soyad + telefon güncelleme (Server Action, kendi satırı — RLS `profiles_update_own_except_role`).

## 6. Teknik Notlar

- Tüm mutasyonlar Server Actions: `getUser()` → Zod → yazma; fiyat asla istemciden alınmaz.
- Basit akışlar `?saved/?error` + banner; form akışları (özel modül, analiz/tez, profil) `useActionState` ile alan hatası döner.
- Başarılı eğitim talebi sonrası kullanıcı Eğitimlerim'e yönlenir (talebini stepper'da görür).
