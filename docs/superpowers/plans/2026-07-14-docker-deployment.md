# Docker Production Deployment Implementation Plan

> **For agentic workers:** Inline execution — spec: `docs/superpowers/specs/2026-07-14-docker-deployment-design.md`

**Goal:** Dockerfile + docker-compose ile production deploy; port 5000; tüm env Docker'dan.

**Architecture:** Multi-stage standalone Next.js 15; compose env_file + build args.

**Tech Stack:** Node 20 Alpine, Docker Compose, Next.js standalone

---

### Task 1: next.config.ts standalone
- [x] `output: "standalone"` ekle

### Task 2: Docker dosyaları
- [x] `Dockerfile` (deps → builder → runner)
- [x] `.dockerignore`
- [x] `docker-compose.yml` (5000:3000)

### Task 3: Environment dosyaları
- [x] `.env.production` (gitignore, gerçek değerler)
- [x] `.env.production.example` (şablon)
- [x] `.gitignore` güncelle

### Task 4: README Docker bölümü
- [x] Kullanım komutları + Supabase redirect notları

### Task 5: Doğrulama
- [ ] `docker compose build` başarılı
- [ ] Container ayakta, port 5000 yanıt veriyor
