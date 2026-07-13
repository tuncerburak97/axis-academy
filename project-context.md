# Axis Akademi – Proje Teknik Şartnamesi

## 1. Genel Bakış

Axis Akademi, üç ana hizmet başlığını tek çatı altında sunan bir web sitesi:

| Modül | İçerik | Fiyatlandırma Modeli | İşleyiş |
|---|---|---|---|
| **Analiz** | Bibliyometrik analiz, İstatistiksel analiz | Fiyat yok, "Bize Ulaşın" | Talep bazlı, **admin manuel işler** |
| **Eğitim** | Excel / Word / PowerPoint eğitimleri | Dinamik, admin panelden yönetilir | **Dinamik** – kullanıcı talep/kayıt akışı otomatik işler |
| **Tez Düzenleme** | Tez düzenleme hizmeti | Fiyat yok, "Bize Ulaşın" | Talep bazlı, **admin manuel işler** |

**Netleşen kararlar:**
- Site üzerinden online ödeme **yok** (fiyat gösterilir, ödeme site dışında konuşulur)
- Sınıf eğitimlerinde fiyat **sabit tablo** (kişi sayısı aralığına göre)
- **Üyelik/login zorunlu** – aktif eğitimleri görmek ve herhangi bir talep/işlem yapmak için kayıt şart
- Kayıt olmadan sadece **genel tanıtım + ortalama/başlangıç fiyat bilgisi** görülebilir
- Kayıt: **e-posta + şifre** (e-posta doğrulama kodu ile) **veya Google ile tek tıkla kayıt**
- Bireysel "kendi modülünü oluştur" fiyatı = saatlik sabit ücret × toplam saat
- Analiz / Tez / bireysel özel eğitim talepleri **admin tarafından manuel** işlenir
- Sınıf eğitimlerinde sistem **daha dinamik**: kullanıcı talebi/kaydı otomatik akar, admin genel bilgilendirme + fiyatlandırma + gruplamayı yönetir
- Admin girişi ayrı credential ile, tamamen **veritabanında tutulur** (rol bazlı)
- Sertifika sistemi şimdilik yok (Faz 2)
- Tasarım: **eğitim temalı, profesyonel, dark mode yok**, sade ama modern/dinamik UI — bilgi kirliliği yok
- Teknik altyapı: **Next.js + Supabase + Tailwind + Vercel**

> **Onay bekleyen varsayım:** "Kayıt zorunluluğu" kuralını sadece Eğitim'de değil, Analiz ve Tez talep formlarında da uyguluyorum (yani herhangi bir form göndermek için de kayıt gerekiyor). Sadece eğitim içinse söylemen yeterli, o kısmı ayırırım.

---

## 2. Site Haritası

**Herkese Açık (Public):**
- Anasayfa – 3 modülün net, sade tanıtımı
- Analiz sayfası – hizmet anlatımı + ortalama fiyat aralığı (görsel, alt başlıklar)
- Eğitim sayfası – genel modül tanıtımı (Excel/Word/PowerPoint), "başlangıç fiyatı ...₺'den" gibi gösterge, **aktif sınıf listesi / detaylı fiyat tablosu YOK**
- Tez Düzenleme sayfası – hizmet anlatımı + ortalama fiyat aralığı
- Hakkımızda / SSS / İletişim
- Kayıt Ol / Giriş Yap (e-posta+şifre veya Google)

**Sadece Kayıtlı Kullanıcıya Açık:**
- Aktif/açık sınıf listesi, detaylı fiyat tabloları
- Bireysel modül oluşturma ekranı (konu seçimi + saat girişi)
- Analiz / Tez / Eğitim talep formları (gönderme işlemi)
- Üye Paneli (bkz. Bölüm 3.4)

**Admin Paneli:**
- İçerik, paket, modül, konu, sınıf, talep, kullanıcı yönetimi + dashboard

---

## 3. Kullanıcı Akışları

### 3.1 Kayıt / Giriş
- E-posta + şifre ile kayıt → e-postaya doğrulama kodu/linki gönderilir → doğrulanmadan aktif özelliklere erişim yok
- **Google ile Kayıt Ol** butonu → tek tıkla hesap oluşturma (Supabase Auth Google OAuth provider)
- Giriş yapılmadan: kullanıcı gezinebilir, genel bilgi ve ortalama fiyat görebilir, **hiçbir form gönderemez, aktif sınıf/eğitim detayı göremez**

### 3.2 Analiz / Tez Düzenleme
Giriş yap (veya kayıt ol) → form doldur → Supabase'e kaydedilir → admin bildirim alır → **admin manuel olarak** durumu günceller (yeni / görüşüldü / devam ediyor / tamamlandı) ve süreci yönetir.

### 3.3 Eğitim
- **Yol A (Hazır Paket):** Paket seç → sabit fiyat gösterilir → talep oluştur
- **Yol B (Kendi Modülün):** Konu havuzundan çoklu seçim → toplam saat gir → `saatlik ücret × saat` otomatik hesaplanır → talep oluştur
- **Sınıf:** Modül seç → açık/aktif sınıflar listelenir (tarih, kalan kontenjan, kişi sayısına göre sabit fiyat tablosu) → katıl → kayıt otomatik işlenir

Tüm bu adımlar **giriş yapılmış olmayı** gerektirir.

### 3.4 Üye Paneli (Giriş Sonrası)
Kullanıcı giriş yaptıktan sonra net ve detaylı bir görünüm almalı:
- **Aktif eğitimlerim** – devam eden bireysel talepler ve sınıf kayıtları
- **İlerleme durumu** – her aktif eğitim için durum/aşama göstergesi (örn. talep alındı → planlandı → devam ediyor → tamamlandı)
- **Geçmiş taleplerim** – analiz, tez, tamamlanmış eğitimler
- **Diğer eğitimleri keşfet** – henüz katılmadığı modül/sınıfları görme ve yeni talep oluşturma
- **Hesap bilgileri** – profil, iletişim bilgisi güncelleme

---

## 4. Veritabanı Şeması (Supabase / Postgres)

```
profiles                 (user_id, ad_soyad, telefon, auth_provider[email|google], email_verified, created_at)

education_modules        (id, title, category[excel|word|powerpoint], type[bundle|custom], 
                           public_price_hint,  -- "800TL'den baslayan fiyatlarla" (herkese acik gosterge)
                           is_active)

bundle_packages          (id, module_id, title, fixed_price, duration_hours)

topics                   (id, module_id, title, description)   -- konu havuzu, kayitli kullaniciya acik

individual_requests      (id, user_id, type, module_id, topic_ids[], total_hours, calculated_price,
                           status[talep_alindi|planlandi|devam_ediyor|tamamlandi|iptal],
                           progress_note, admin_notes, created_at)

classes                  (id, module_id, title, start_date, capacity, enrolled_count, status[acik|dolu|tamamlandi])

class_pricing_tiers      (id, module_id, min_people, max_people, price_per_person_per_hour)

class_enrollments        (id, class_id, user_id, 
                           status[kayitli|devam_ediyor|tamamlandi|iptal], created_at)

contact_requests         (id, user_id, service_type[analiz|tez], mesaj, dosya_url,
                           status[yeni|gorusuldu|devam_ediyor|tamamlandi], admin_notes, created_at)

site_content             (page_key, section_key, content_json)  -- admin'in duzenledigi metin/gorseller

admin_users               (id, email, password (Supabase Auth ile yonetilir), role)
```

> Not: `contact_requests` ve `individual_requests` admin tarafından **manuel** güncellenir (durum, not vs.). `classes` ve `class_enrollments` kullanıcı etkileşimiyle **otomatik** güncellenir.

---

## 5. Admin Panel Özellikleri

**Genel Dashboard (giriş ekranı):**
- Aktif kullanıcı sayısı
- Aktif eğitim / sınıf sayısı
- Bekleyen talepler (analiz, tez, bireysel eğitim) sayısı
- Doluluk durumu özet grafiği (sınıf bazlı)

**İçerik Yönetimi**
- Anasayfa ve diğer sayfaların metin/görsel içeriği
- Eğitim modülü genel bilgilendirme metinleri (kullanıcıya "bilgi" amaçlı gösterilecek içerik)

**Eğitim / Fiyatlandırma / Gruplama**
- Modül, hazır paket, konu havuzu yönetimi
- Sınıf oluşturma: tarih, kontenjan, kişi sayısına göre fiyat tablosu (tier) girme
- **Grup (sınıf) yönetimi:** kayıtlı kullanıcıları görme/çıkarma, kontenjan/doluluk takibi, sınıf durumunu güncelleme (açık/dolu/tamamlandı)
- Fiyat tier'larını modül bazında düzenleme

**Talep Yönetimi (Manuel Süreç)**
- Analiz, Tez, bireysel özel eğitim taleplerini tek listede görme
- Her talebe not düşme, durum güncelleme

**Kullanıcı Yönetimi**
- Kayıtlı kullanıcı listesi, e-posta doğrulama durumu, aktif/geçmiş eğitimleri

**Admin Girişi**
- Ayrı, veritabanında tutulan admin credential'ları (rol bazlı yetkilendirme)

---

## 6. Tasarım ve UX Yönergeleri
- **Public tarafta bilgi sadeliği esas:** kullanıcı boğulmamalı, her modül net ve az sayıda güçlü mesajla anlatılmalı
- **Eğitim teması ön planda**, genel his profesyonel ve kurumsal
- **Dark mode yok** – aydınlık, güvenilir bir kurumsal görünüm
- **Dinamik, modern, advanced UI/UX** – mikro-etkileşimler, akıcı geçişler, güçlü görsel hiyerarşi (frontend-design ilkeleriyle agresif ve özgün bir tasarım dili kurulacak, şablon/kalıp görünümden kaçınılacak)
- Kayıt olmayan kullanıcıya "merak uyandıran ama boğmayan" bir deneyim: genel bilgi + gösterge fiyat, detay için kayıt CTA'sı net

---

## 7. Teknik Altyapı
- **Next.js (App Router, TypeScript)** – frontend + API routes
- **Supabase** – Auth (e-posta/şifre + Google OAuth, e-posta doğrulama), Postgres, Storage (tez/analiz dosya yüklemeleri)
- **Tailwind CSS** – arayüz
- **Vercel** – hosting
- **E-posta bildirimi** – Supabase Edge Function + Resend/SendGrid (yeni talep → admin bildirimi, doğrulama kodu → kullanıcı)
- **Middleware / route guard** – giriş yapılmamış kullanıcının aktif eğitim/talep sayfalarına erişimini engelleyen kontrol katmanı

---

## 8. Faz Planı

**Faz 1 – MVP**
Anasayfa + genel tanıtım (public), kayıt/giriş (e-posta+Google), Analiz/Tez form akışı, Eğitim (bireysel+sınıf, sabit fiyat tablosu), Üye Paneli (aktif eğitim + ilerleme), Admin Paneli (dashboard, içerik, fiyatlandırma/gruplama, talep yönetimi)

**Faz 2 – Sonraki Adımlar**
Sertifika sistemi, blog/SEO içerikleri, referans/vaka çalışması galerisi, indirim kodu sistemi, gelişmiş raporlama

---

## 9. Netleştirilmesi Gereken Küçük Noktalar
- Kayıt zorunluluğu Analiz/Tez formları için de geçerli mi? *(varsayılan: evet, hepsi için geçerli)*
- Analiz/Tez formunda dosya yükleme alanı olsun mu?
- Marka kimliği (logo, renk paleti) hazır mı, yoksa tasarım aşamasında da destek gerekiyor mu?
