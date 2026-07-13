# Axis Akademi — Admin Nav Aktif Talep Rozeti Spesifikasyonu

Tarih: 2026-07-13 · Durum: Onaylandı · Üst doküman: `2026-07-13-admin-management-design.md`

## 1. Amaç

Admin sol menüsündeki **Talepler** öğesinde, işlem bekleyen veya devam eden talepler varsa `Inbox` ikonunun sağ üstünde dairesel bir rozet ile toplam adet gösterilir. Admin, sayfayı yenilemeden talep güncellediğinde rozet `revalidatePath` ile güncellenir.

## 2. Kullanıcı Kararları

| Karar | Seçim |
|---|---|
| Sayım kapsamı | **C** — tamamlanmamış / kapatılmamış tüm talepler |
| Görsel format | **A** — mevcut `Inbox` ikonu üzerinde bildirim rozeti |
| Veri kaynağı | Server-side count; layout → `AdminNav` prop |
| Sıfır durumu | Rozet gizlenir |

## 3. Aktif Talep Tanımı

Toplam = üç tablonun aktif kayıt sayılarının toplamı.

| Tablo | Aktif durumlar | Hariç |
|---|---|---|
| `contact_requests` | `new`, `contacted`, `in_progress` | `completed` |
| `individual_requests` | `received`, `planned`, `in_progress` | `completed`, `cancelled` |
| `public_inquiries` | `new`, `answered` | `closed` |

Sorgular Supabase `{ count: "exact", head: true }` ile çalışır; satır verisi taşınmaz (dashboard pattern'i ile aynı).

## 4. Mimari

```
AdminLayout (RSC, mevcut admin guard)
  └─ getActiveRequestCount() → number
  └─ <AdminNav activeRequestCount={count} />
       └─ pathname tabanlı aktif link (mevcut davranış)
       └─ Talepler öğesinde ikon rozeti (count > 0)
```

### 4.1 Yeni dosya: `src/lib/queries/admin-requests.ts`

- `getActiveRequestCount(): Promise<number>` export eder.
- Üç count sorgusunu `Promise.all` ile paralel çalıştırır.
- `.in("status", [...])` filtreleri yukarıdaki tabloya göre uygulanır.
- Herhangi bir sorgu hata verirse `0` döner (nav kırılmaz).

### 4.2 Güncelleme: `src/app/(admin)/admin/(dashboard)/layout.tsx`

- `getActiveRequestCount()` çağrılır.
- Sonuç `<AdminNav activeRequestCount={count} />` prop'u olarak geçilir.

### 4.3 Güncelleme: `src/components/admin/admin-nav.tsx`

- `AdminNavProps` arayüzü: `activeRequestCount: number`.
- Yalnızca `href === "/admin/talepler"` öğesinde rozet render edilir.
- `activeRequestCount > 0` koşulu sağlanmazsa rozet yok.

## 5. UI Spesifikasyonu

### Rozet

- Konum: `Inbox` ikonu `relative` sarmalayıcı içinde; rozet `absolute -right-1.5 -top-1.5`.
- Stil: `rounded-full bg-amber-soft text-[10px] font-bold leading-none` (talepler sayfasındaki “yeni” rozetleriyle tutarlı).
- Boyut: min genişlik/yükseklik ~16px; tek/çift haneli sayı.
- 99 üzeri: `99+` metni.
- Rozet `aria-hidden="true"` (dekoratif).

### Erişilebilirlik

- `activeRequestCount > 0` iken link `aria-label`: `"Talepler, {n} aktif talep"`.
- `activeRequestCount === 0` iken `aria-label` eklenmez; görünür metin `"Talepler"` yeterli.

## 6. Güncelleme ve Önbellek

- Mevcut `revalidateRequestViews()` ve `updateInquiry` içindeki `revalidatePath("/admin/talepler")` admin layout'u da yeniler.
- Ek polling veya client-side fetch **yok**.
- Layout `dynamic` zorlaması gerekmez; admin sayfaları zaten `force-dynamic` veya mutasyon sonrası revalidate kullanıyor.

## 7. Kapsam Dışı

- Dashboard “Bekleyen Talep” kartının C kapsamına güncellenmesi (ayrı iyileştirme).
- Mobil admin menüsü (sidebar şu an `md:flex`; mevcut davranış korunur).
- Gerçek zamanlı WebSocket / polling.
- Talepler sayfası bölüm rozetlerinin C kapsamına genişletilmesi.

## 8. Doğrulama

Manuel test checklist:

1. Her üç tabloda aktif kayıt varken nav'da rozet doğru toplamı gösterir.
2. Tüm talepler tamamlandığında/kapatıldığında rozet kaybolur.
3. Talep durumu güncellenince (kaydet sonrası) rozet sayısı değişir.
4. Talepler linki aktifken rozet okunabilir kalır.
5. Ekran okuyucu `aria-label` ile sayıyı duyurur.
