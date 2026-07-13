# Axis Akademi — Docker Production Deployment Spesifikasyonu

Tarih: 2026-07-14 · Durum: Onaylandı

## 1. Amaç

Next.js 15 uygulamasını production ortamında Docker ile çalıştırmak. Container dışarıdan **5000** portundan HTTP ile erişilebilir; HTTPS harici nginx/Caddy ile `axisakademi.com` üzerinden sağlanır. Tüm environment değişkenleri Docker üzerinden okunur.

## 2. Kullanıcı Kararları

| Karar | Seçim |
|---|---|
| Domain | `axisakademi.com` |
| Dış port | `5000` (HTTP) |
| SSL | Harici nginx/Caddy (compose dışında) |
| Supabase | Cloud (harici; compose'a DB eklenmez) |
| Resend e-posta | Boş — bildirimler atlanır |
| Build yaklaşımı | Multi-stage `standalone` Dockerfile |

## 3. Dosya Yapısı

```
Dockerfile                  # Multi-stage: deps → builder → runner
.dockerignore               # Build context filtresi
docker-compose.yml          # App servisi, port mapping, env
.env.production             # Production değerleri (gitignore)
.env.production.example     # Şablon (commit edilir)
next.config.ts              # output: 'standalone' eklenir
.gitignore                  # .env.production eklenir
README.md                   # Docker kullanım bölümü
```

## 4. Dockerfile

### Aşamalar

| Aşama | Base Image | Görev |
|---|---|---|
| `deps` | `node:20-alpine` | `package.json` + `package-lock.json` → `npm ci` |
| `builder` | `node:20-alpine` | Kaynak kopyala, `NEXT_PUBLIC_*` ARG ile `npm run build` |
| `runner` | `node:20-alpine` | Standalone çıktı, non-root `nextjs` kullanıcı |

### Build Arguments (builder aşaması)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Bu değişkenler client bundle'a build sırasında gömülür; Dockerfile'da `ARG` + `ENV` olarak builder'a aktarılır.

### Runner Ayarları

- `ENV NODE_ENV=production`
- `ENV PORT=3000`
- `ENV HOSTNAME=0.0.0.0`
- `EXPOSE 3000`
- `CMD ["node", "server.js"]`
- Çalışma dizini: `/app`
- Kullanıcı: `nextjs` (uid 1001, non-root)

## 5. docker-compose.yml

Tek servis: `app`

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
    env_file: .env.production
    ports:
      - "5000:3000"
    restart: unless-stopped
    environment:
      NODE_ENV: production
```

Build args ve runtime env aynı `.env.production` dosyasından okunur (`docker compose --env-file .env.production`).

## 6. Environment Değişkenleri

### Zorunlu (build + runtime)

| Değişken | Açıklama | Production değeri |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL | `https://ysroydlnzrfscrqaltds.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | `.env.local` ile aynı değer |

### Uygulama meta

| Değişken | Açıklama | Production değeri |
|---|---|---|
| `APP_URL` | Public site URL (dokümantasyon/nginx referansı) | `https://axisakademi.com` |
| `NODE_ENV` | Ortam | `production` |

### Opsiyonel (boş — bildirimler atlanır)

| Değişken | Açıklama | Production değeri |
|---|---|---|
| `SUPABASE_SECRET_KEY` | Sunucu tarafı secret (runtime'da kullanılmıyor) | Boş |
| `RESEND_API_KEY` | Resend API anahtarı | Boş |
| `ADMIN_EMAIL` | Bildirim alıcı e-posta | Boş |
| `EMAIL_FROM` | Gönderen adresi | Boş |

### Env dosya stratejisi

- **`.env.production`** — gerçek değerler; `.gitignore`'da; deploy sırasında sunucuya kopyalanır
- **`.env.production.example`** — placeholder şablon; repoya commit edilir

## 7. next.config.ts Değişikliği

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  images: { ... }, // mevcut ayar korunur
};
```

## 8. .dockerignore

Hariç tutulacaklar:

- `node_modules`, `.next`, `out`, `build`
- `.git`, `.env`, `.env*.local`, `.env.production`
- `README.md`, `docs/`, `design/`, `.cursor/`, `.superpowers/`
- `supabase/` (migration SQL — runtime'da gerekmez)

## 9. Ağ ve Port

```
İnternet
  → nginx/Caddy (443 HTTPS, axisakademi.com)
    → localhost:5000 (HTTP)
      → Docker container port 3000 (Next.js)
```

Port mapping: `5000:3000` (host:container)

## 10. Supabase Dashboard (manuel, deploy öncesi)

Authentication → URL Configuration:

- **Site URL:** `https://axisakademi.com`
- **Redirect URLs:** `https://axisakademi.com/auth/callback`

## 11. Kullanım Komutları

```bash
# İlk build ve başlatma
docker compose --env-file .env.production up -d --build

# Loglar
docker compose logs -f app

# Durdurma
docker compose down

# Yeniden build (kod değişikliği sonrası)
docker compose --env-file .env.production up -d --build
```

Erişim: `http://localhost:5000` (nginx arkasında `https://axisakademi.com`)

## 12. nginx Örnek Proxy (host tarafı, kapsam dışı ama referans)

```nginx
server {
    listen 443 ssl;
    server_name axisakademi.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 13. Kapsam Dışı

- nginx/Caddy kurulum dosyaları (host tarafında ayrı)
- Yerel Supabase container
- CI/CD pipeline / container registry
- Resend production yapılandırması
- Let's Encrypt otomasyonu

## 14. Güvenlik

- `.env.production` asla git'e commit edilmez
- `.env.production.example` yalnızca placeholder içerir
- Container non-root kullanıcı ile çalışır
- `SUPABASE_SECRET_KEY` client'a sızdırılmaz (zaten `NEXT_PUBLIC_` prefix'i yok)

## 15. Doğrulama

1. `docker compose --env-file .env.production up -d --build` başarılı tamamlanır
2. `http://localhost:5000` ana sayfayı gösterir
3. Supabase auth (giriş/kayıt) çalışır
4. Admin paneli (`/admin/login`) erişilebilir
5. `RESEND_API_KEY` boşken uygulama hatasız çalışır (bildirim atlanır)
6. Container restart sonrası uygulama otomatik ayağa kalkar (`unless-stopped`)
