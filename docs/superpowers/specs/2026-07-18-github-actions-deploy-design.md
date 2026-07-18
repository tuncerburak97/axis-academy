# Axis Akademi — GitHub Actions Build & Deploy Spesifikasyonu

Tarih: 2026-07-18 · Durum: Onaylandı

## 1. Amaç

`main` branch’ine push veya manuel tetik ile:

1. Docker image’ı GitHub Actions üzerinde build edip Docker Hub’a push etmek
2. Hetzner sunucusuna SSH ile bağlanıp yeni image’ı çekerek `docker compose` ile yeniden başlatmak

Referans: aynı sunucudaki `civar-http-api` workflow iskeleti; Axis’e `NEXT_PUBLIC_*` build-arg, SHA tag ve HTTP smoke check uyarlamaları eklenir.

## 2. Kullanıcı Kararları

| Karar | Seçim |
|---|---|
| Yaklaşım | Civar iskeleti + Axis uyarlamaları |
| Trigger | `push` → `main` + `workflow_dispatch` |
| Image | `tuncerburak/axis-academy` |
| Tag | `latest` + kısa commit SHA (7 karakter) |
| Deploy path | `/home/axis-academy` |
| SSH | `appleboy/ssh-action@v1` + GitHub Secrets |
| Registry | Docker Hub |
| Compose modeli | Sunucuda `image:` pull; CI’da build |
| Health | Civar `healthy` sayımı yok; HTTP smoke (`curl` → `:5000`) |
| Scope dışı | Blue/green, GHCR, nginx CI yönetimi, compose healthcheck |

## 3. Mimari

```
GitHub (main push / workflow_dispatch)
        │
        ▼
┌─────────────────────┐
│ Job: build-and-push │  ubuntu-latest
│  checkout → Hub login → build (NEXT_PUBLIC_* args) → push
│  tags: tuncerburak/axis-academy:latest
│        tuncerburak/axis-academy:<short-sha>
└──────────┬──────────┘
           │ needs:
           ▼
┌─────────────────────┐
│ Job: deploy         │  appleboy/ssh-action → Hetzner
│  cd /home/axis-academy
│  docker pull …:latest
│  docker compose down --timeout 30
│  docker image prune -f
│  docker compose up -d
│  sleep + HTTP smoke
└─────────────────────┘
```

- Tek workflow: `.github/workflows/deploy.yml`
- Sunucudaki `.env.production` git’e ve CI’ye girmez; runtime secret’lar sunucuda kalır
- CI yalnızca image üretir ve sunucuya pull/restart yaptırır

## 4. Dosya Değişiklikleri

```
.github/workflows/deploy.yml   # Yeni — 2 job pipeline
docker-compose.yml             # build: kaldırılır; image: eklenir
README.md                      # CI/CD + secret kurulum notu (kısa)
```

Mevcut `Dockerfile` ve `deploy/nginx/*` değişmez.

## 5. Workflow Detayı

### 5.1 Trigger

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

### 5.2 Job: `build-and-push`

| Adım | Action / komut | Not |
|---|---|---|
| Checkout | `actions/checkout@v4` | — |
| Login | `docker/login-action@v3` | `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` |
| Build & push | `docker/build-push-action@v5` | `context: .`, `push: true` |

**Tags**

- `tuncerburak/axis-academy:latest`
- `tuncerburak/axis-academy:${GITHUB_SHA::7}` (workflow içinde short SHA)

**Build args** (Dockerfile ile uyumlu)

- `NEXT_PUBLIC_SUPABASE_URL` ← GitHub secret/variable
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← GitHub secret/variable

### 5.3 Job: `deploy`

- `needs: [build-and-push]`
- `appleboy/ssh-action@v1`

| Input | Kaynak |
|---|---|
| `host` | `secrets.SERVER_HOST` |
| `username` | `secrets.SERVER_USER` |
| `key` | `secrets.SERVER_SSH_KEY` |
| `port` | `secrets.SERVER_SSH_PORT` (yoksa 22) |

**Remote script**

```bash
cd /home/axis-academy

echo "=== Pulling latest image ==="
docker pull tuncerburak/axis-academy:latest

echo "=== Stopping old containers ==="
docker compose down --timeout 30

echo "=== Pruning unused images ==="
docker image prune -f

echo "=== Starting new containers ==="
docker compose up -d

echo "=== Waiting for app ==="
sleep 15

echo "=== Container status ==="
docker compose ps

echo "=== Smoke check ==="
if ! curl -fsS --max-time 10 http://127.0.0.1:5000/ >/dev/null; then
  echo "ERROR: smoke check failed"
  docker compose logs --tail 50 app
  exit 1
fi

echo "=== Deploy completed successfully ==="
```

Civar’daki `healthy` / `api` sayımı kullanılmaz (Axis compose’da healthcheck yok).

## 6. docker-compose.yml Hedef Hali

```yaml
services:
  app:
    image: tuncerburak/axis-academy:latest
    env_file: .env.production
    ports:
      - "5000:3000"
    restart: unless-stopped
    environment:
      NODE_ENV: production
```

- `build:` bloğu kaldırılır; production image kaynağı Docker Hub’dır
- Yerel/dev için image build ihtiyacı ayrı (README’de not); production yolu pull’dur

## 7. GitHub Secrets / Variables

| İsim | Tür | Amaç |
|---|---|---|
| `DOCKERHUB_USERNAME` | secret | Docker Hub kullanıcı (örn. `tuncerburak`) |
| `DOCKERHUB_TOKEN` | secret | Docker Hub access token |
| `NEXT_PUBLIC_SUPABASE_URL` | secret veya variable | Image build-arg |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | secret veya variable | Image build-arg |
| `SERVER_HOST` | secret | Hetzner IP/hostname |
| `SERVER_USER` | secret | SSH kullanıcı |
| `SERVER_SSH_KEY` | secret | Deploy private key (PEM) |
| `SERVER_SSH_PORT` | secret (opsiyonel) | Default 22 |

Aynı Hetzner sunucusundaki `civar-http-api` ile `SERVER_*` secret’ları paylaşılabilir.

## 8. Sunucu İlk Kurulum (bir kerelik)

1. Dizin: `/home/axis-academy`
2. Bu dizine güncel `docker-compose.yml` kopyala
3. `.env.production` oluştur ve doldur (`.env.production.example` şablonu)
4. SSH deploy key: private → GitHub `SERVER_SSH_KEY`; public → sunucu `authorized_keys`
5. Deploy user’ın Docker/Compose çalıştırabildiğinden emin ol
6. İlk deploy: workflow tetikle veya elle `docker pull` + `docker compose up -d`

Nginx (`deploy/nginx/axisakademi.conf`) bu pipeline kapsamı dışındadır; mevcut kurulum korunur.

## 9. Hata Yönetimi ve Rollback

| Durum | Davranış |
|---|---|
| Build/push fail | `deploy` job çalışmaz |
| SSH / pull / compose fail | Job kırmızı; loglar Actions’da |
| Smoke fail | `exit 1` + `docker compose logs --tail 50 app` |

**Rollback:** Hub’daki SHA tag ile geri dön:

```bash
cd /home/axis-academy
docker pull tuncerburak/axis-academy:<eski-short-sha>
# geçici: compose image tag’ini SHA’ya çekip up -d, veya
docker tag tuncerburak/axis-academy:<eski-short-sha> tuncerburak/axis-academy:latest
docker compose up -d
```

## 10. Doğrulama (acceptance)

- [ ] `main` push veya manuel tetik workflow’u başlatır
- [ ] Hub’da `latest` ve short-SHA tag’leri görünür
- [ ] Sunucuda container yeni image ile ayağa kalkar
- [ ] `curl http://127.0.0.1:5000/` (sunucu içi) başarılı
- [ ] Public site (`axisakademi.com`) yeni sürümü sunar
- [ ] Build fail olduğunda deploy adımı çalışmaz

## 11. Scope Dışı (YAGNI)

- Zero-downtime / blue-green
- GHCR veya başka registry
- Compose `healthcheck:` ekleme
- Nginx/SSL’i CI’dan yönetme
- Supabase migration otomasyonu
- Otomatik rollback
