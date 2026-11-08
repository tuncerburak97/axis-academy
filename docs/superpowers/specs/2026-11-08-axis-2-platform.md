# Axis Akademi 2.0 — Platform sözleşmesi

Tarih: 2026-11-08 · Plan: https://claude.ai/artifact/UCxFz8nGMRimZmHvgqLSqW

Bu doküman public site, üye alanı ve admin konsolunun birlikte nasıl çalıştığını tanımlar.
Üç alan paralel geliştirildiği için **dosya sahipliği** ve **rota sözleşmesi** kesindir.

## Kararlar

- Katalog (programlar, dönemler, fiyatlar, müfredat) herkese açık. Giriş yalnızca başvuru/teklif anında istenir.
- Ödeme platformda hiç takip edilmez. Fiyatlar bilgi amaçlı gösterilir.
- Tek tema: aydınlık. Renk paleti korunur (mürekkep `ink`, indigo `accent`, amber `amber`).
- Stok fotoğraf kullanılmaz; ürünün kendisi (dönemler, müfredat, ilerleme) gösterilir.

## Veri modeli (supabase/migrations/0013_platform.sql)

| Kavram | Tablo | Not |
|---|---|---|
| Program | `education_modules` | `slug`, `level`, `audience`, `outcomes`, `features`, `long_description` |
| Paket | `bundle_packages` (+ `bundle_syllabus_weeks`) | Birebir hazır paket, sabit fiyat |
| Konu havuzu | `topics` | Birebir "kendi programın" için |
| Fiyat planı | `pricing_plans` | `individual` saatlik / `group` kişi aralığı |
| Dönem | `classes` | `price`, `location`, `meeting_url`, `instructor_id`, `status open/full/completed/cancelled` |
| Dönem kaydı | `class_enrollments` | `pending → enrolled → (in_progress) → completed`, `waitlisted`, `cancelled`; iptal sonrası tekrar başvuru serbest |
| Talep | `requests` | `kind: analysis/thesis/corporate/training`, `training_mode: bundle/custom/schedule`, durum hattı `received → quoted → approved → planned → in_progress → completed` (+ `cancelled`), `details` jsonb, teklif alanları |
| Talep mesajı | `request_messages` | `is_staff` |
| Talep dosyası | `request_files` | storage `request-files/{talep sahibinin uid}/{request_id}/{dosya}`; `is_deliverable` admin teslimi |
| Oturum | `sessions` | `class_id` ya da `request_id` (biri); takvim ve hatırlatma kaynağı |
| Bildirim | `notifications` | DB tetikleyicileri üretir; kod yalnızca okur/okundu işaretler |
| Sertifika | `certificates` | `complete_class()` üretir; `verify_certificate(code)` herkese açık |
| Yorum | `reviews` | Üye yazar, admin yayınlar; `get_public_reviews()` |
| İndirim kodu | `discount_codes` | `check_discount_code(code)` yüzde döner |
| Blog | `posts` | `slug`, `body_md` |
| Kayıt geçmişi | `audit_log` | `src/lib/audit.ts → logAudit()` |

Eski `contact_requests` ve `individual_requests` tabloları **artık okunmaz/yazılmaz**; verileri `requests`'e taşındı.

### RPC'ler

- `get_catalog_cohorts(p_module_id?, p_limit?)` — herkese açık dönem listesi, `taken_seats`, `my_status`
- `request_class_enrollment(p_class_id, p_note?, p_discount_code?)` — dolu dönemde otomatik bekleme listesi
- `cancel_my_enrollment(id)`, `cancel_my_request(id)`, `respond_to_quote(id, accept)`
- Admin: `approve_class_enrollment(id)`, `admin_add_enrollment(class_id, user_id)`, `complete_class(id)`
- `mark_notifications_read()`, `check_discount_code(code)`, `verify_certificate(code)`, `get_public_reviews(module?, limit?)`

Tipler: `src/lib/supabase/database.types.ts` (üretilmiş) ve `src/lib/types/platform.ts` (etiketler, durum hattı yardımcıları).
Yeniden üretmek için: `npx supabase gen types typescript --local --schema public > src/lib/supabase/database.types.ts`

## Rota sözleşmesi

### Public (`src/app/(public)`)
- `/` anasayfa · `/programlar` katalog · `/programlar/[slug]` program (slug ya da eski id kabul edilir)
- `/analiz`, `/tez-duzenleme`, `/kurumsal` hizmet sayfaları
- `/teklif/[tur]` talep sihirbazı (`analiz | tez | kurumsal | birebir`), `?program=<slug>&paket=<id>` ön seçim
- `/hakkimizda`, `/sss`, `/iletisim`, `/blog`, `/blog/[slug]`, `/sertifika/[kod]` (doğrulama)
- `/giris`, `/kayit`, `/sifremi-unuttum`, `/sifre-yenile` — hepsi `?next=` destekler
- Döneme başvuru: program sayfasındaki diyalog → `applyToCohort` aksiyonu; giriş yoksa `/giris?next=/programlar/<slug>?basvur=<classId>`

### Üye alanı (`src/app/(panel)/panel`)
- `/panel` Bugün · `/panel/takvim` · `/panel/egitimler` · `/panel/egitimler/[classId]`
- `/panel/talepler` · `/panel/talepler/[id]` (durum hattı, teklif onayı, mesajlar, dosyalar, oturumlar)
- `/panel/belgeler` (sertifikalar + teslim dosyaları) · `/panel/bildirimler` · `/panel/hesap`
- `/panel/derslerim` ve `/panel/derslerim/[classId]` (yalnızca eğitmen rolü)
- "Yeni talep" → public `/teklif/...`; "Keşfet" → public `/programlar`

### Admin (`src/app/(admin)/admin`)
- `/admin` dikkat bekleyenler · `/admin/talepler` (liste + pano) · `/admin/talepler/[id]`
- `/admin/donemler` · `/admin/donemler/[id]` · `/admin/takvim`
- `/admin/programlar` · `/admin/programlar/[id]` (genel, müfredat, paketler, fiyatlar, konular)
- `/admin/kisiler` · `/admin/kisiler/[id]` · `/admin/sorular` (anonim iletişim mesajları)
- `/admin/icerik` · `/admin/blog` · `/admin/yorumlar` · `/admin/indirimler` · `/admin/ayarlar` (roller, kayıt geçmişi)
- `/admin/login` (ayrı giriş; önyüzde link yok, admin olmayana tüm `/admin` 404)

Eski rotalar (`/egitim`, `/panel/kesfet`, `/panel/sinif/*`, `/panel/talep/*`, `/admin/moduller/*`, `/admin/siniflar/*`) `next.config.ts` yönlendirmeleriyle yeni adreslere gider.

## Dosya sahipliği

| Alan | Sahip olduğu dosyalar |
|---|---|
| Public | `src/app/(public)/**`, `src/app/auth/**`, `src/components/public/**`, `src/components/auth/**`, `src/lib/actions/{public,auth,requests,enroll}.ts`, `src/lib/queries/{catalog,content,blog}.ts`, `src/lib/navigation.ts` |
| Üye | `src/app/(panel)/**`, `src/components/panel/**`, `src/lib/actions/member.ts`, `src/lib/queries/member.ts` |
| Admin | `src/app/(admin)/**`, `src/components/admin/**`, `src/lib/actions/admin-*.ts`, `src/lib/queries/admin-*.ts` |
| Ortak (değiştirmeden kullan) | `src/components/ui/**`, `src/lib/{auth,format,email,audit,utils}.ts`, `src/lib/types/platform.ts`, `src/lib/queries/notifications.ts`, `src/lib/actions/notifications.ts`, `src/lib/supabase/**`, `supabase/**` |

Ortak bir dosyada değişiklik gerekiyorsa kendi alanında yerel bir yardımcı yaz; ortak dosyaya dokunma.

## Tasarım kuralları

- Bileşenler `src/components/ui` kitinden: `Button`, `Badge`, `Card`, `Field/Input/Select/Textarea/ChoiceCard`, `Tabs`, `Dialog`, `Menu/Tooltip`, `toast`, `StatusTrack`, `WeekStrip`, `ProgressBar`, `DateTile`, `SeatMeter`, `Price`, `Stat`, `Avatar`, `Kbd`, `EmptyState`, `Alert`, `Skeleton`, `PageHeader`, `SectionHeading`, `Accent`, `Eyebrow`. Canlı örnekler: `/kit`.
- Tipografi: Geist (arayüz), başlıkta en fazla bir kelime `Accent` (Instrument Serif italik), tarih/saat/fiyat/kontenjan `font-mono tabular`.
- Ekranda tek birincil (indigo) buton. Koyu `Card variant="inverse"` ekranın tek odak noktası için.
- Durum hem metinle hem biçimle (rozet + nokta, durum hattı) gösterilir.
- Animasyon içerik görünürken başlar; içerik hiçbir zaman `opacity: 0` ile beklemez. `motion` kullanılacaksa yalnızca küçük mikro etkileşimler.
- Mobil önce: 375px'te yatay kaydırma yok; üye alanında alt sekme çubuğu.
- Boş durumlar sıradaki adımı söyler. Hata metinleri neyin yanlış olduğunu ve nasıl düzeltileceğini söyler.
- Metinler Türkçe, sade, aktif; "siz" yerine samimi "sen" dili (mevcut sitedeki gibi).
- Sunucu aksiyonları `useActionState` + `toast` ile sonuç bildirir; `?saved=` banner'ları kullanılmaz.
- Admin işlemleri `logAudit()` ile kayıt geçmişine yazılır. Kullanıcıyı etkileyen admin işlemleri `emailMember()` ile e-posta da gönderir (uygulama içi bildirimi DB tetikleyicisi zaten üretir).

## Yerel geliştirme

```bash
npx supabase start      # yerel Postgres + Auth + Storage (Docker)
npx supabase db reset   # migration + seed'leri baştan uygular
npm run dev
```

Test hesapları `supabase/seed_local_dev.sql` içinde (yalnızca yerel veritabanında geçerli).
