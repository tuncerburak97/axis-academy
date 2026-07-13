-- supabase/seed_syllabus.sql
-- Excel (10), Word (8) ve PowerPoint (8) modülleri için başlangıç müfredatı

insert into public.module_syllabus_weeks (module_id, week_number, title, description, sort_order) values
(
  'e0000000-0000-4000-8000-000000000001',
  1,
  'Excel arayüzü ve veri girişi temelleri',
  'Çalışma kitabı mantığı, hücre/sütun/satır, temel biçimlendirme ve veri girişi standartları.',
  1
),
(
  'e0000000-0000-4000-8000-000000000001',
  2,
  'Formüller ve hücre referansları',
  'Toplama, ortalama, koşullu formüller; göreli/mutlak referanslar ve yayınlama hatalarının önlenmesi.',
  2
),
(
  'e0000000-0000-4000-8000-000000000001',
  3,
  'Sıralama, filtreleme ve veri temizliği',
  'Veri setlerinde tutarlılık, yinelenen kayıtlar, metin/ayrıştırma ve hızlı filtre teknikleri.',
  3
),
(
  'e0000000-0000-4000-8000-000000000001',
  4,
  'DÜŞEYARA, ÇAPRAZARA ve arama fonksiyonları',
  'Tablolar arası eşleştirme, XLOOKUP benzeri senaryolar ve yaygın hata türleri.',
  4
),
(
  'e0000000-0000-4000-8000-000000000001',
  5,
  'Pivot tablolar — özet ve analiz',
  'Ham veriden özet tablo üretimi, alan düzeni, gruplama ve ilk seviye analiz.',
  5
),
(
  'e0000000-0000-4000-8000-000000000001',
  6,
  'Pivot grafikler ve görselleştirme',
  'Doğru grafik seçimi, etiket/eksen düzeni ve yönetime sunulabilir görseller.',
  6
),
(
  'e0000000-0000-4000-8000-000000000001',
  7,
  'Koşullu biçimlendirme ve veri doğrulama',
  'Kritik eşiklerin görünür olması, açılır listeler ve hatalı girişin engellenmesi.',
  7
),
(
  'e0000000-0000-4000-8000-000000000001',
  8,
  'Grafikler ve mini dashboard bileşenleri',
  'Kombine grafikler, sparkline mantığı ve tek sayfada KPI özeti.',
  8
),
(
  'e0000000-0000-4000-8000-000000000001',
  9,
  'Makrolar ve tekrarlayan işlerin otomasyonu',
  'Kayıt makrosu, temizleme adımları ve günlük rapor akışlarının hızlandırılması.',
  9
),
(
  'e0000000-0000-4000-8000-000000000001',
  10,
  'Kurumsal rapor şablonu ve teslim',
  'Yazdırma ayarları, paylaşım, son kontrol listesi ve gerçek iş dosyası üzerinde teslim.',
  10
)
on conflict (module_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Sınıf sürelerini müfredat ile hizala (örnek sınıflar)
update public.classes
set duration_weeks = 10
where module_id = 'e0000000-0000-4000-8000-000000000001' and duration_weeks < 10;

-- Word ile Profesyonel Belgeler — 8 haftalık müfredat
insert into public.module_syllabus_weeks (module_id, week_number, title, description, sort_order) values
(
  'e0000000-0000-4000-8000-000000000002',
  1,
  'Word arayüzü ve belge yapısı',
  'Sekmeler, görünüm modları, sayfa düzeni ve profesyonel belge iskeletinin kurulması.',
  1
),
(
  'e0000000-0000-4000-8000-000000000002',
  2,
  'Stil mimarisi ve tutarlı biçimlendirme',
  'Paragraf ve karakter stilleri, stil galerisi ve tek tıkla yeniden biçimlendirme.',
  2
),
(
  'e0000000-0000-4000-8000-000000000002',
  3,
  'Uzun belge yönetimi',
  'Bölümler, kesmeler, sayfa numaralandırma ve içindekiler tablosu.',
  3
),
(
  'e0000000-0000-4000-8000-000000000002',
  4,
  'Atıf ve kaynakça yönetimi',
  'APA/IEEE stilleri, dipnotlar, kaynakça listesi ve otomatik güncelleme.',
  4
),
(
  'e0000000-0000-4000-8000-000000000002',
  5,
  'Tez ve rapor şablonları',
  'Enstitü/kurum kılavuzuna uygun şablon üretimi ve kapak sayfası standartları.',
  5
),
(
  'e0000000-0000-4000-8000-000000000002',
  6,
  'Ortak çalışma ve sürümleme',
  'Değişiklik izleme, açıklamalar, belge karşılaştırma ve güvenli paylaşım.',
  6
),
(
  'e0000000-0000-4000-8000-000000000002',
  7,
  'Toplu belge üretimi',
  'Adres-mektup birleştirme, alan kodları ve otomatik belge akışları.',
  7
),
(
  'e0000000-0000-4000-8000-000000000002',
  8,
  'Baskı, PDF ve teslim standartları',
  'Yazdırma ayarları, erişilebilir PDF, son kontrol listesi ve teslim.',
  8
)
on conflict (module_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- PowerPoint ile Etkileyici Sunum — 8 haftalık müfredat
insert into public.module_syllabus_weeks (module_id, week_number, title, description, sort_order) values
(
  'e0000000-0000-4000-8000-000000000003',
  1,
  'Sunum kurgusu ve anlatı',
  'Mesaj hiyerarşisi, hikâye akışı ve slayt planlama çerçevesi.',
  1
),
(
  'e0000000-0000-4000-8000-000000000003',
  2,
  'Görsel tasarım ilkeleri',
  'Hizalama, boşluk, renk ve tipografiyle profesyonel görünüm.',
  2
),
(
  'e0000000-0000-4000-8000-000000000003',
  3,
  'Asıl slayt ve kurumsal şablonlar',
  'Master mimarisi, yer tutucular ve marka uyumlu şablon üretimi.',
  3
),
(
  'e0000000-0000-4000-8000-000000000003',
  4,
  'Sunumda veri görselleştirme',
  'Grafik ve tabloların sadeleştirilmesi, doğru görsel seçimi.',
  4
),
(
  'e0000000-0000-4000-8000-000000000003',
  5,
  'Görsel hiyerarşi ve slayt kompozisyonu',
  'Tek mesaj kuralı, görsel ağırlık ve okunabilirlik.',
  5
),
(
  'e0000000-0000-4000-8000-000000000003',
  6,
  'Animasyon ve geçişler',
  'Dikkati yöneten, abartısız hareket tasarımı ve zamanlama.',
  6
),
(
  'e0000000-0000-4000-8000-000000000003',
  7,
  'Sahne ve sunum teknikleri',
  'Sunucu görünümü, prova, zamanlama ve etkileşim.',
  7
),
(
  'e0000000-0000-4000-8000-000000000003',
  8,
  'Teslim formatları ve final sunum',
  'PDF/video export, paylaşım, son kontrol ve sahne teslimi.',
  8
)
on conflict (module_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

update public.classes
set duration_weeks = 8
where module_id in (
  'e0000000-0000-4000-8000-000000000002',
  'e0000000-0000-4000-8000-000000000003'
) and duration_weeks < 8;
