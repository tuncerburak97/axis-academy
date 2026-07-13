# Axis Akademi — Görsellik & Motion Cilası Spesifikasyonu

Tarih: 2026-07-13 · Durum: Onaylandı · Kapsam: public taraf (panel/admin sade kalır)

## 1. Hedef

Public sitenin "ciddi emek" hissi vermesi: eğitim temalı fotoğraflar, yüksek seviye mikro-etkileşimler ve ikon çeşitliliği.

## 2. Görseller

- Kaynak: Unsplash (next.config izinli); tüm URL'ler `src/lib/images.ts`'te toplanır, tek yerden değiştirilebilir.
- Yerleşim: anasayfa hero kompozisyonu (fotoğraf + yüzen rozet kartları), hizmet kartı üst görselleri, eğitim modül kartlarında kategori görselleri, modül detayında görsel bant, Analiz/Tez sayfalarında yan görsel.
- `next/image` ile optimize; anlamlı `alt` metinleri.

## 3. Motion (framer-motion / `motion` paketi)

- Ortak primitifler `src/components/public/motion-primitives.tsx`: `Reveal` (scroll'da fade+yukarı), `FadeUp` (gecikmeli giriş), `FloatingBadge` (yüzen rozet).
- Hero elemanları sırayla girer; bölümler scroll'da belirir; kartlarda hover yükselme + görsel zoom ve tıklamada basılma CSS ile (JS maliyeti düşük tutulur).
- `useReducedMotion` ile hareket azaltma tercihi desteklenir (WCAG).

## 4. İkon Çeşitliliği

- Kategoriye özel ikonlar: Excel `FileSpreadsheet` (yeşil ton), Word `FileText` (mavi), PowerPoint `Presentation` (turuncu) — kart ve detaylarda renkli rozetlerle.
- "Nasıl çalışır", özellik listeleri ve CTA bölgelerinde bağlama uygun lucide ikonları.

## 5. Teknik

- Yeni bağımlılık: `motion` (^12). Kullanıcı `npm install` çalıştırır.
- Kategori görsel/ikon eşlemeleri tek modülde; bileşen sınırları küçük tutulur (motion yalnız client primitiflerde).
