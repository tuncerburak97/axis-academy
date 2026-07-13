# Class Materials — Tasarım Spec (Faz 1)

**Tarih:** 2026-07-14 | **Durum:** Onaylandı

## Amaç
Admin'in sınıfa PDF/Office dosyası eklemesi, güncellemesi ve üyenin önizlemesi — güvenilir ve anlamlı hata mesajlarıyla.

## Kararlar
- Upload: Server Action + `bodySizeLimit: 25mb` (hemen fix)
- Bucket: migration ile otomatik oluşturma
- `updateMaterial`: dosya değiştirme (eski storage silinir)
- MIME/uzantı sunucu doğrulaması
- Üye: PDF inline iframe önizleme + indirme
- Hata kodları: `file_too_large`, `upload_failed`, `invalid_type`, `bucket_missing`

## Test
1. 5MB PDF yükle → başarılı
2. Dosyayı güncelle → eski dosya silinir
3. Üye panelinde PDF önizleme görünür
