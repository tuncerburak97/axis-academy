# Axis Akademi

Analiz, Eğitim (Excel/Word/PowerPoint) ve Tez Düzenleme hizmetleri için Next.js 15 + Supabase web uygulaması.

## Kurulum

```bash
npm install
copy .env.example .env.local   # Windows
# cp .env.example .env.local   # macOS/Linux
npm run dev
```

`.env.local` içine Supabase URL/anahtarlarını ve (isteğe bağlı) Resend e-posta ayarlarını yaz.

## Supabase

1. [supabase.com](https://supabase.com) üzerinde proje oluştur.
2. `supabase/migrations/` altındaki SQL dosyalarını **sırayla** SQL Editor'da çalıştır:
   - `0001_schema.sql`
   - `0002_pricing.sql`
   - `0003_member.sql`
   - `0004_admin_management.sql`
   - `0005_courses_inquiries.sql`
   - `0006_storage_buckets.sql` — storage bucket'ları otomatik oluşturur
   - `0007_admin_delete_policies.sql` — admin hard delete RLS politikaları
3. Authentication → Providers'tan **Email** (doğrulama açık) ve **Google** sağlayıcılarını etkinleştir.
4. Storage bucket'ları `0006` migration ile otomatik oluşur. Eski kurulumlarda manuel oluşturmak istersen **private** bucket'lar:
   - `request-files` — analiz/tez talep dosyaları
   - `class-materials` — sınıf materyalleri
5. Proje URL ve publishable key'i `.env.local`'a yaz.
6. Kullanıcı silme için Supabase Dashboard → Settings → API → **service_role** secret'ı `SUPABASE_SECRET_KEY` olarak ekle.

### Seed verileri (isteğe bağlı)

Migration'lardan sonra örnek içerik için:

```sql
-- supabase/seed_education.sql  → modüller, konular, paketler, fiyat planları, örnek sınıflar
-- supabase/seed_courses.sql    → ek sınıflar ve örnek MD materyaller
```

### Eksik profil düzeltmesi

Kullanıcı migration'dan önce oluşturulduysa `profiles` satırı eksik kalabilir. `supabase/fix_missing_profiles.sql` içindeki e-postayı değiştirip çalıştır.

## E-posta bildirimleri (Resend)

Yeni taleplerde admin'e bildirim için `.env.local`:

```
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@example.com
EMAIL_FROM=Axis Akademi <noreply@yourdomain.com>
```

`RESEND_API_KEY` yoksa uygulama çalışır; bildirimler atlanır.

## Admin Hesabı

1. Dashboard → Authentication → Users → **Add user** ile admin hesabını oluştur ("Auto confirm" işaretli).
2. `supabase/promote_admin.sql` içindeki e-postayı kendi admin e-postanla değiştirip SQL Editor'da çalıştır.
3. Girişi `/admin/login` adresinden yap — önyüzde bu sayfaya link yoktur ve `/admin` altındaki
   tüm sayfalar admin olmayan herkese 404 döndürür.

## Yapı

- `src/app/(public)` — herkese açık tanıtım sayfaları
- `src/app/(panel)/panel` — üye paneli (giriş gerekli)
- `src/app/(admin)/admin` — yönetim paneli (admin rolü gerekli)
- `src/lib/supabase` — server/client Supabase istemcileri
- `src/lib/email.ts` — Resend bildirimleri
- `supabase/migrations` — veritabanı şeması ve RLS politikaları
- `supabase/seed_*.sql` — örnek eğitim verileri
- `docs/superpowers/specs` — onaylı tasarım spesifikasyonları

## Komutlar

```bash
npm run dev          # geliştirme sunucusu
npm run build        # production derlemesi
npm run lint         # ESLint
npm run check-types  # TypeScript kontrolü
```

## Docker (Production)

Uygulama `axisakademi.com` için containerize edilmiştir. Dışarıdan **5000** portu (HTTP); HTTPS harici nginx/Caddy ile sağlanır.

### Kurulum

```bash
copy .env.production.example .env.production   # Windows
# cp .env.production.example .env.production   # macOS/Linux
# .env.production içindeki Supabase değerlerini doldur

docker compose --env-file .env.production up -d --build
```

Erişim: `http://localhost:5000`

### Supabase (deploy öncesi)

Authentication → URL Configuration:

- **Site URL:** `https://axisakademi.com`
- **Redirect URLs:** `https://axisakademi.com/auth/callback`

### Diğer komutlar

```bash
docker compose logs -f app      # loglar
docker compose down             # durdur
docker compose up -d --build    # yeniden build + başlat
```

### nginx (host tarafı)

Tam config: `deploy/nginx/axisakademi.conf` — sunucuya kopyalayıp aşağıdaki adımları izleyin.

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx/axisakademi.conf /etc/nginx/sites-available/axisakademi.com
sudo ln -sf /etc/nginx/sites-available/axisakademi.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/certbot
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d axisakademi.com -d www.axisakademi.com
```
