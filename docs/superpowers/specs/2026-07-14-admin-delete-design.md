# Admin Hard Delete — Tasarım Spec (Faz 2)

**Tarih:** 2026-07-14 | **Durum:** Onaylandı

## Amaç
Admin'in kullanıcı, sınıf, modül ve talepleri kalıcı silmesi; kayıt tamamen uçar.

## Kararlar
- Hard delete (soft delete yok)
- `SUPABASE_SECRET_KEY` ile `auth.admin.deleteUser`
- Sınıf silme: storage materyalleri önce temizlenir
- Onay dialog'u zorunlu (native `<dialog>`)
- Kendini / son admin'i silme engeli
- RLS DELETE policy migration

## Silinebilir varlıklar
Kullanıcı, sınıf, modül, contact_request, individual_request, public_inquiry
