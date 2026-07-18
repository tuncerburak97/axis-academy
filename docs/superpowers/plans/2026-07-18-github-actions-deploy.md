# GitHub Actions Docker Hub + Hetzner Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `main` push / manuel tetik ile Docker Hub’a image push edip Hetzner’da `/home/axis-academy` üzerinde compose ile deploy etmek.

**Architecture:** İki job’lu GitHub Actions workflow (`build-and-push` → `deploy`). CI image’ı Hub’a basar; sunucu `image: tuncerburak/axis-academy:latest` ile pull eder. Runtime env sunucudaki `.env.production`’da kalır; `NEXT_PUBLIC_*` sadece build-arg olarak CI secret’larından gelir.

**Tech Stack:** GitHub Actions, `docker/login-action@v3`, `docker/build-push-action@v5`, `appleboy/ssh-action@v1`, Docker Hub, Docker Compose

**Spec:** `docs/superpowers/specs/2026-07-18-github-actions-deploy-design.md`

## Global Constraints

- Image adı tam olarak: `tuncerburak/axis-academy`
- Tag’ler: `latest` + 7 karakter short SHA
- Deploy path: `/home/axis-academy`
- Trigger: `push` → `main` + `workflow_dispatch`
- Compose production yolu: Hub pull (`image:`); sunucuda `build:` yok
- Smoke: `curl -fsS http://127.0.0.1:5000/`
- Dockerfile ve `deploy/nginx/*` değiştirilmez
- Scope dışı: blue/green, GHCR, compose healthcheck, nginx CI

## File Structure

| Dosya | Sorumluluk |
|---|---|
| `docker-compose.yml` | Production servis tanımı — Hub image + env_file + port 5000 |
| `.github/workflows/deploy.yml` | Build/push + SSH deploy pipeline |
| `README.md` | Docker pull akışı + CI secret / sunucu kurulum notları |

---

### Task 1: Compose’u Hub image modeline geçir

**Files:**
- Modify: `docker-compose.yml`
- Test: `docker compose config` (yerel)

**Interfaces:**
- Consumes: Mevcut `.env.production` / example (değişmez)
- Produces: Servis `app` → `image: tuncerburak/axis-academy:latest` (build yok)

- [ ] **Step 1: `docker-compose.yml` içeriğini spec hedef haliyle değiştir**

Tam dosya:

```yaml
# docker-compose.yml — Axis Akademi production (HTTP 5000 → container 3000)
# Image is built/pushed by GitHub Actions; server pulls from Docker Hub.
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

- [ ] **Step 2: Compose config doğrula**

Run:

```bash
docker compose -f docker-compose.yml config
```

Expected: YAML parse başarılı; çıktıda `image: tuncerburak/axis-academy:latest` görünür; `build:` anahtarı yok.

Not: Yerelde `.env.production` yoksa `env_file` uyarısı gelebilir — kabul edilebilir. Varsa `--env-file .env.production` kullanma zorunlu değil; `config` yine parse eder.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: pull Axis production image from Docker Hub"
```

---

### Task 2: Deploy workflow’unu ekle

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: Task 1 compose (`image: …:latest`); Dockerfile build-args `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Produces: Workflow adı `Build, Push, and Deploy`; job’lar `build-and-push`, `deploy`

- [ ] **Step 1: Dizini oluştur ve workflow dosyasını yaz**

```bash
mkdir -p .github/workflows
```

Tam dosya `.github/workflows/deploy.yml`:

```yaml
# .github/workflows/deploy.yml — Build to Docker Hub, deploy on Hetzner
name: Build, Push, and Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set short SHA
        id: meta
        run: echo "short_sha=${GITHUB_SHA::7}" >> "$GITHUB_OUTPUT"

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push axis-academy
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            tuncerburak/axis-academy:latest
            tuncerburak/axis-academy:${{ steps.meta.outputs.short_sha }}
          build-args: |
            NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${{ secrets.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }}

  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          port: ${{ secrets.SERVER_SSH_PORT || 22 }}
          script: |
            set -e
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

- [ ] **Step 2: Yerel yapısal doğrulama**

Run:

```bash
test -f .github/workflows/deploy.yml
grep -q 'tuncerburak/axis-academy' .github/workflows/deploy.yml
grep -q 'workflow_dispatch' .github/workflows/deploy.yml
grep -q 'NEXT_PUBLIC_SUPABASE_URL' .github/workflows/deploy.yml
grep -q '/home/axis-academy' .github/workflows/deploy.yml
grep -q 'appleboy/ssh-action@v1' .github/workflows/deploy.yml
```

Expected: tüm komutlar exit 0.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add Docker Hub build and Hetzner deploy workflow"
```

---

### Task 3: README — Docker pull + CI/CD notları

**Files:**
- Modify: `README.md` (Docker bölümü ~satır 91–120; altına CI/CD ekle)

**Interfaces:**
- Consumes: Task 1 compose pull modeli; Task 2 secret isimleri
- Produces: Operatörün sunucu + GitHub secret kurulumunu yapabileceği dokümantasyon

- [ ] **Step 1: Docker (Production) kurulum komutlarını pull modeline güncelle**

`### Kurulum` altındaki `docker compose ... --build` yerine:

```markdown
### Kurulum (sunucu)

Image CI tarafından Docker Hub’a basılır. Sunucuda:

```bash
cp .env.production.example .env.production
# .env.production değerlerini doldur
# Bu dizinde güncel docker-compose.yml olmalı (/home/axis-academy)

docker pull tuncerburak/axis-academy:latest
docker compose up -d
```

Erişim (sunucu içi): `http://127.0.0.1:5000` — public: `https://axisakademi.com`
```

`### Diğer komutlar` bloğunu şöyle değiştir:

```markdown
### Diğer komutlar

```bash
docker compose logs -f app
docker compose down
docker pull tuncerburak/axis-academy:latest && docker compose up -d
```
```

- [ ] **Step 2: CI/CD bölümünü Docker bölümünden sonra ekle** (nginx bölümünden önce)

```markdown
## CI/CD (GitHub Actions)

Workflow: `.github/workflows/deploy.yml`

- **Trigger:** `main` push veya Actions → *Build, Push, and Deploy* → Run workflow
- **Akış:** Docker Hub build/push → SSH ile `/home/axis-academy` üzerinde pull + compose restart + smoke check

### Gerekli GitHub Secrets

| Secret | Açıklama |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub kullanıcı adı |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `NEXT_PUBLIC_SUPABASE_URL` | Build-time Supabase URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Build-time publishable key |
| `SERVER_HOST` | Hetzner IP / hostname |
| `SERVER_USER` | SSH kullanıcı |
| `SERVER_SSH_KEY` | Deploy private key (PEM) |
| `SERVER_SSH_PORT` | Opsiyonel; yoksa 22 |

### Sunucu ilk kurulum (bir kerelik)

1. `/home/axis-academy` oluştur; `docker-compose.yml` ve `.env.production` koy
2. Deploy public key’i `authorized_keys` içine ekle; user Docker çalıştırabilsin
3. Secret’ları GitHub repo Settings → Secrets and variables → Actions içine gir
4. İlk deploy: workflow’u manuel tetikle veya `main`’e push et

### Rollback

```bash
cd /home/axis-academy
docker pull tuncerburak/axis-academy:<eski-short-sha>
docker tag tuncerburak/axis-academy:<eski-short-sha> tuncerburak/axis-academy:latest
docker compose up -d
```
```

- [ ] **Step 3: README’de anahtar metinleri doğrula**

Run:

```bash
grep -q 'tuncerburak/axis-academy' README.md
grep -q 'DOCKERHUB_TOKEN' README.md
grep -q '/home/axis-academy' README.md
grep -q 'workflow_dispatch\|Run workflow' README.md
```

Expected: exit 0 (son satırda `Run workflow` eşleşir).

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: document Hub pull deploy and GitHub Actions secrets"
```

---

### Task 4: Operatör doğrulama checklist (kod dışı)

**Files:** Yok (manuel / repo Settings + sunucu)

**Interfaces:**
- Consumes: Task 2 workflow + Task 3 README secret listesi
- Produces: İlk başarılı pipeline veya bilinen eksik secret listesi

Bu task kod değiştirmez. Implementasyon agent’ı checklist’i kullanıcıya sunar; secret değerlerini agent doldurmaz.

- [ ] **Step 1: Kullanıcıya şu checklist’i ilet (işaretlemesini iste)**

```text
[ ] GitHub Secrets: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN
[ ] GitHub Secrets: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
[ ] GitHub Secrets: SERVER_HOST, SERVER_USER, SERVER_SSH_KEY (, SERVER_SSH_PORT)
[ ] Sunucu: /home/axis-academy + güncel docker-compose.yml + .env.production
[ ] Sunucu: SSH key authorized_keys; docker compose çalışıyor
[ ] Actions → Build, Push, and Deploy → Run workflow (veya main push)
[ ] Hub’da latest + short-sha tag görünür
[ ] curl http://127.0.0.1:5000/ sunucuda OK
[ ] https://axisakademi.com yeni sürümü gösteriyor
```

- [ ] **Step 2: Commit yok** — bu task dokümantasyon/kod üretmez; plan dosyasındaki checkbox’ları tamamlandı olarak işaretle yalnızca checklist kullanıcıya iletildiyse.

---

## Spec coverage (self-review)

| Spec gereksinimi | Task |
|---|---|
| Trigger main + workflow_dispatch | Task 2 |
| Hub login + build/push + latest + short SHA | Task 2 |
| NEXT_PUBLIC_* build-args | Task 2 |
| SSH deploy path `/home/axis-academy` | Task 2 |
| pull → down → prune → up → smoke | Task 2 |
| compose `image:` (build yok) | Task 1 |
| README / secret / sunucu kurulum | Task 3 |
| Operatör secrets + ilk deploy | Task 4 |
| Dockerfile / nginx değişmez | Hiçbir task dokunmaz |
| Rollback dokümantasyonu | Task 3 |

Placeholder yok; secret isimleri Task 2/3 arasında tutarlı.
