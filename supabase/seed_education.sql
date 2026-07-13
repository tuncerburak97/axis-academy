-- supabase/seed_education.sql
-- Örnek kurumsal eğitim kataloğu: 3 modül, konular, paketler, fiyat planları, açık sınıflar.
-- Sabit UUID'ler kullanılır; script tekrar çalıştırılırsa mevcut kayıtlar güncellenir (upsert).
-- Tüm metinler örnektir — admin panelden serbestçe güncellenebilir.

-- ============================================================
-- MODÜLLER
-- ============================================================
insert into public.education_modules
  (id, title, category, description, long_description, features, badge, public_price_hint, is_active, sort_order)
values
(
  'e0000000-0000-4000-8000-000000000001',
  'Excel ile Veri Ustalığı',
  'excel',
  'Ham veriyi karar destekleyen raporlara dönüştürün: formüllerden dashboard kurulumuna uçtan uca Excel yetkinliği.',
  E'Kurumların en büyük zaman kaybı, veriyle boğuşmaktır. Bu program; raporlamayla uğraşan uzmanlardan yöneticilere kadar herkesin Excel''i bir hesap tablosu değil, bir karar destek aracı olarak kullanmasını hedefler.\n\nEğitim tamamen uygulamalıdır: her konu gerçek iş senaryoları üzerinden işlenir, katılımcılar kendi verileriyle çalışabilir. Program sonunda katılımcılar; veri temizliğinden pivot analizine, otomasyondan yönetim dashboard''larına kadar tüm süreci bağımsız yürütebilir hâle gelir.\n\nİçerik, binlerce saatlik kurumsal eğitim deneyimiyle şekillenmiş modüler bir müfredata dayanır; ihtiyaca göre daraltılıp genişletilebilir.',
  array[
    'Dağınık veri yığınlarını dakikalar içinde okunabilir raporlara dönüştürme',
    'Pivot tablo ve pivot grafiklerle yönetime hazır özetler çıkarma',
    'DÜŞEYARA/ÇAPRAZARA ve iç içe formüllerde hatasız kurulum',
    'Koşullu biçimlendirmeyle kritik verinin anında görünür olması',
    'Veri doğrulama kurallarıyla hatalı veri girişinin önlenmesi',
    'Binlerce satırlık tablolarda hız ve dosya performansı yönetimi',
    'Doğru grafik seçimiyle etkili veri hikâyeleştirme',
    'Tekrarlayan işlerin makrolarla otomatikleştirilmesi',
    'Tek ekranda tüm KPI''lar: profesyonel dashboard kurulumu',
    'Yazdırma, paylaşım ve rapor standartlarının oturtulması'
  ],
  'En Çok Tercih Edilen',
  '800₺''den başlayan fiyatlarla',
  true, 1
),
(
  'e0000000-0000-4000-8000-000000000002',
  'Word ile Profesyonel Belgeler',
  'word',
  'Tezden kurumsal rapora: uzun ve karmaşık belgeleri standartlara uygun, hızlı ve hatasız üretin.',
  E'Bir belgenin ciddiyeti, içeriği kadar biçimiyle de ölçülür. Bu program; akademisyenlerin, öğrencilerin ve kurumsal ekiplerin Word''ü el yordamıyla değil, sistemli bir üretim aracı olarak kullanmasını sağlar.\n\nStil mimarisi doğru kurulduğunda içindekiler tablosu, başlık numaralandırma ve kaynakça kendiliğinden işler; saatler süren biçim düzeltmeleri dakikalara iner. Eğitim boyunca gerçek tez ve rapor dosyaları üzerinde çalışılır.\n\nProgram, enstitü kılavuzları ve kurumsal belge standartları göz önünde bulundurularak eski akademisyenlerden oluşan kadromuzca tasarlanmıştır.',
  array[
    'Stil mimarisiyle tüm belgenin tek tıkla yeniden biçimlenmesi',
    'Otomatik içindekiler, şekil ve tablo listelerinin kurulması',
    'Başlık ve sayfa numaralandırmada enstitü/kurum standardı uyumu',
    'Atıf ve kaynakça yönetimi (APA, IEEE ve dergi stilleri)',
    'Yüzlerce sayfalık belgelerde bölüm ve kesme yönetimi',
    'Kurumsal şablon oluşturma ve ekip genelinde standartlaştırma',
    'Adres-mektup birleştirme ile toplu belge üretimi',
    'Değişiklik izleme ve sürüm karşılaştırmayla güvenli ortak çalışma',
    'Erişilebilir (engelsiz) belge üretim pratikleri',
    'Baskıya ve PDF yayınına hazır çıktı standartları'
  ],
  'Akademisyen Favorisi',
  '750₺''den başlayan fiyatlarla',
  true, 2
),
(
  'e0000000-0000-4000-8000-000000000003',
  'PowerPoint ile Etkileyici Sunum',
  'powerpoint',
  'Slayt yığınlarını ikna eden anlatılara çevirin: kurumsal kimliğe uygun, akılda kalan sunumlar tasarlayın.',
  E'Kararlar çoğu zaman bir sunumun ikna gücüyle şekillenir. Bu program; içeriği olan ama sahnede ve slaytta hak ettiği etkiyi yaratamayan profesyoneller için tasarlandı.\n\nKatılımcılar; görsel hiyerarşi, veri görselleştirme ve anlatı kurgusunu tek bir üretim akışında birleştirmeyi öğrenir. Asıl slayt (master) mimarisiyle kurumsal şablonlar kurulur, ekipteki herkesin aynı kalitede sunum üretmesi sağlanır.\n\nEğitim; yurt içi ve yurt dışı panellerde yüzlerce sunum yapmış eğitmenlerin saha deneyimiyle harmanlanmış pratik tekniklere dayanır.',
  array[
    'Mesaj öncelikli slayt kurgusu: her slaytta tek güçlü fikir',
    'Görsel hiyerarşiyle bakışın doğru noktaya yönlendirilmesi',
    'Asıl slayt (master) ile kurumsal şablon mimarisi kurma',
    'Karmaşık verinin sunumda sade ve doğru görselleştirilmesi',
    'Animasyon ve geçişlerin doğru dozda, amaca hizmet eden kullanımı',
    'Marka renk/yazı tipi tutarlılığının tüm destede korunması',
    'Sunucu görünümü ve prova araçlarıyla sahne hâkimiyeti',
    'Görsel, video ve medyanın sorunsuz gömülmesi',
    'Yönetim sunumu, eğitim ve teklif desteleri için ayrı formatlar',
    'PDF, video ve paylaşım formatlarında kayıpsız teslim'
  ],
  'Yeni Müfredat',
  '750₺''den başlayan fiyatlarla',
  true, 3
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  long_description = excluded.long_description,
  features = excluded.features,
  badge = excluded.badge,
  public_price_hint = excluded.public_price_hint,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ============================================================
-- KONU HAVUZU (özel modül kurucusunu besler)
-- ============================================================
insert into public.topics (id, module_id, title, description, estimated_hours, is_active) values
-- Excel
('a0000000-0000-4000-8000-000000000101', 'e0000000-0000-4000-8000-000000000001', 'Formüller ve Fonksiyonlar', 'Temelden ileri düzeye formül kurulumu, hata ayıklama ve iç içe fonksiyonlar.', 8, true),
('a0000000-0000-4000-8000-000000000102', 'e0000000-0000-4000-8000-000000000001', 'Pivot Tablolar ve Analiz', 'Pivot tablo, pivot grafik ve dilimleyicilerle çok boyutlu analiz.', 6, true),
('a0000000-0000-4000-8000-000000000103', 'e0000000-0000-4000-8000-000000000001', 'Veri Temizliği ve Doğrulama', 'Dağınık verinin standartlaştırılması, veri doğrulama ve koruma.', 4, true),
('a0000000-0000-4000-8000-000000000104', 'e0000000-0000-4000-8000-000000000001', 'Veri Görselleştirme', 'Doğru grafik seçimi, biçimlendirme ve rapor estetiği.', 5, true),
('a0000000-0000-4000-8000-000000000105', 'e0000000-0000-4000-8000-000000000001', 'Makrolar ve Otomasyon', 'Makro kaydı, düzenleme ve tekrarlayan işlerin otomasyonu.', 6, true),
('a0000000-0000-4000-8000-000000000106', 'e0000000-0000-4000-8000-000000000001', 'Dashboard Tasarımı', 'KPI seçimi, etkileşimli kontroller ve yönetim paneli kurulumu.', 8, true),
-- Word
('a0000000-0000-4000-8000-000000000201', 'e0000000-0000-4000-8000-000000000002', 'Stil Mimarisi', 'Stil tabanlı belge kurulumu ve tek tıkla yeniden biçimlendirme.', 5, true),
('a0000000-0000-4000-8000-000000000202', 'e0000000-0000-4000-8000-000000000002', 'Uzun Belge Yönetimi', 'Bölümler, kesmeler, çapraz başvurular ve alan kodları.', 6, true),
('a0000000-0000-4000-8000-000000000203', 'e0000000-0000-4000-8000-000000000002', 'Atıf ve Kaynakça', 'APA/IEEE stillerinde atıf, kaynakça ve dipnot yönetimi.', 4, true),
('a0000000-0000-4000-8000-000000000204', 'e0000000-0000-4000-8000-000000000002', 'Tez ve Rapor Şablonları', 'Enstitü/kurum kılavuzuna uygun şablon üretimi.', 5, true),
('a0000000-0000-4000-8000-000000000205', 'e0000000-0000-4000-8000-000000000002', 'Ortak Çalışma ve Sürümleme', 'Değişiklik izleme, açıklamalar ve belge karşılaştırma.', 3, true),
('a0000000-0000-4000-8000-000000000206', 'e0000000-0000-4000-8000-000000000002', 'Toplu Belge Üretimi', 'Adres-mektup birleştirme ve otomatik belge akışları.', 4, true),
-- PowerPoint
('a0000000-0000-4000-8000-000000000301', 'e0000000-0000-4000-8000-000000000003', 'Sunum Kurgusu ve Anlatı', 'Mesaj hiyerarşisi, hikâye akışı ve slayt planlama.', 5, true),
('a0000000-0000-4000-8000-000000000302', 'e0000000-0000-4000-8000-000000000003', 'Görsel Tasarım İlkeleri', 'Hizalama, boşluk, renk ve tipografiyle profesyonel görünüm.', 6, true),
('a0000000-0000-4000-8000-000000000303', 'e0000000-0000-4000-8000-000000000003', 'Asıl Slayt ve Şablonlar', 'Master mimarisi ve kurumsal şablon üretimi.', 4, true),
('a0000000-0000-4000-8000-000000000304', 'e0000000-0000-4000-8000-000000000003', 'Sunumda Veri Görselleştirme', 'Grafik ve tabloların sunuma uygun sadeleştirilmesi.', 5, true),
('a0000000-0000-4000-8000-000000000305', 'e0000000-0000-4000-8000-000000000003', 'Animasyon ve Geçişler', 'Dikkati yöneten, abartısız hareket tasarımı.', 3, true),
('a0000000-0000-4000-8000-000000000306', 'e0000000-0000-4000-8000-000000000003', 'Sahne ve Sunum Teknikleri', 'Sunucu görünümü, prova, zamanlama ve teslim formatları.', 4, true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  estimated_hours = excluded.estimated_hours,
  is_active = excluded.is_active;

-- ============================================================
-- HAZIR PAKETLER (public popup + üye talepleri)
-- ============================================================
insert into public.bundle_packages (id, module_id, title, description, fixed_price, duration_hours, is_active) values
-- Excel
('b0000000-0000-4000-8000-000000000101', 'e0000000-0000-4000-8000-000000000001', 'Excel Başlangıç Paketi', 'Formüller, tablo yönetimi ve raporlama temelleri. Excel''e güvenle başlamak isteyenler için.', 7500, 10, true),
('b0000000-0000-4000-8000-000000000102', 'e0000000-0000-4000-8000-000000000001', 'Excel Profesyonel Paketi', 'Pivot analiz, veri görselleştirme ve otomasyonla tam donanım. En çok tercih edilen program.', 14000, 20, true),
('b0000000-0000-4000-8000-000000000103', 'e0000000-0000-4000-8000-000000000001', 'Excel Kurumsal Yoğunlaştırılmış', 'Dashboard ve otomasyon ağırlıklı, kurumsal senaryolarla ileri düzey program.', 19500, 30, true),
-- Word
('b0000000-0000-4000-8000-000000000201', 'e0000000-0000-4000-8000-000000000002', 'Word Başlangıç Paketi', 'Stil mimarisi ve belge standartlarının temelleri.', 6000, 8, true),
('b0000000-0000-4000-8000-000000000202', 'e0000000-0000-4000-8000-000000000002', 'Tez Yazım Paketi', 'Uzun belge yönetimi + atıf/kaynakça + enstitü şablonu: tez sürecini uçtan uca kapsar.', 11000, 16, true),
('b0000000-0000-4000-8000-000000000203', 'e0000000-0000-4000-8000-000000000002', 'Word Kurumsal Belge Paketi', 'Kurumsal şablon üretimi, ortak çalışma ve toplu belge akışları.', 15000, 22, true),
-- PowerPoint
('b0000000-0000-4000-8000-000000000301', 'e0000000-0000-4000-8000-000000000003', 'Sunum Temelleri Paketi', 'Kurgu, görsel ilkeler ve şablon kullanımıyla hızlı başlangıç.', 6000, 8, true),
('b0000000-0000-4000-8000-000000000302', 'e0000000-0000-4000-8000-000000000003', 'Profesyonel Sunum Paketi', 'Anlatı + tasarım + veri görselleştirme: yönetim sunumları için tam program.', 12000, 16, true),
('b0000000-0000-4000-8000-000000000303', 'e0000000-0000-4000-8000-000000000003', 'Kurumsal Marka Sunum Paketi', 'Kurumsal şablon mimarisi ve ekip standardizasyonu dahil ileri program.', 16500, 24, true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  fixed_price = excluded.fixed_price,
  duration_hours = excluded.duration_hours,
  is_active = excluded.is_active;

-- ============================================================
-- FİYAT PLANLARI (üyeye görünen matris; bireysel saatlik satır
-- "kendi modülünü oluştur" fiyat hesabının kaynağıdır)
-- ============================================================
insert into public.pricing_plans (id, module_id, training_type, min_people, max_people, price, unit, note, is_active, sort_order) values
-- Excel
('c0000000-0000-4000-8000-000000000101', 'e0000000-0000-4000-8000-000000000001', 'individual', 1, 1, 800, 'per_hour', 'Birebir, programı size göre kurgulanır', true, 1),
('c0000000-0000-4000-8000-000000000102', 'e0000000-0000-4000-8000-000000000001', 'group', 3, 5, 5500, 'total', 'Kişi başı, 10 saatlik grup programı', true, 2),
('c0000000-0000-4000-8000-000000000103', 'e0000000-0000-4000-8000-000000000001', 'group', 6, 10, 4250, 'total', 'Kişi başı, 10 saatlik grup programı', true, 3),
-- Word
('c0000000-0000-4000-8000-000000000201', 'e0000000-0000-4000-8000-000000000002', 'individual', 1, 1, 750, 'per_hour', 'Birebir, tez takvimize göre planlanır', true, 1),
('c0000000-0000-4000-8000-000000000202', 'e0000000-0000-4000-8000-000000000002', 'group', 3, 5, 5000, 'total', 'Kişi başı, 8 saatlik grup programı', true, 2),
('c0000000-0000-4000-8000-000000000203', 'e0000000-0000-4000-8000-000000000002', 'group', 6, 10, 3900, 'total', 'Kişi başı, 8 saatlik grup programı', true, 3),
-- PowerPoint
('c0000000-0000-4000-8000-000000000301', 'e0000000-0000-4000-8000-000000000003', 'individual', 1, 1, 750, 'per_hour', 'Birebir, kendi sunumunuz üzerinde çalışılır', true, 1),
('c0000000-0000-4000-8000-000000000302', 'e0000000-0000-4000-8000-000000000003', 'group', 3, 5, 5000, 'total', 'Kişi başı, 8 saatlik grup programı', true, 2),
('c0000000-0000-4000-8000-000000000303', 'e0000000-0000-4000-8000-000000000003', 'group', 6, 10, 3900, 'total', 'Kişi başı, 8 saatlik grup programı', true, 3)
on conflict (id) do update set
  training_type = excluded.training_type,
  min_people = excluded.min_people,
  max_people = excluded.max_people,
  price = excluded.price,
  unit = excluded.unit,
  note = excluded.note,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ============================================================
-- AÇIK SINIFLAR (tarihleri kendine göre güncelle)
-- ============================================================
insert into public.classes (id, module_id, title, description, start_date, schedule_note, duration_hours, capacity, status) values
('d0000000-0000-4000-8000-000000000101', 'e0000000-0000-4000-8000-000000000001', 'Excel Profesyonel — Ağustos Dönemi', 'Pivot analiz ve dashboard ağırlıklı, uygulamalı akşam sınıfı.', '2026-08-11', 'Salı ve Perşembe 20:00-22:00', 20, 12, 'open'),
('d0000000-0000-4000-8000-000000000201', 'e0000000-0000-4000-8000-000000000002', 'Tez Yazım Kampı — Ağustos Dönemi', 'Tez teslimine hazırlananlar için yoğunlaştırılmış hafta sonu programı.', '2026-08-15', 'Cumartesi 10:00-14:00', 16, 10, 'open'),
('d0000000-0000-4000-8000-000000000301', 'e0000000-0000-4000-8000-000000000003', 'Profesyonel Sunum Atölyesi — Eylül Dönemi', 'Katılımcıların kendi sunumları üzerinde çalıştığı uygulamalı atölye.', '2026-09-07', 'Pazartesi ve Çarşamba 19:30-21:30', 16, 10, 'open')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  start_date = excluded.start_date,
  schedule_note = excluded.schedule_note,
  duration_hours = excluded.duration_hours,
  capacity = excluded.capacity,
  status = excluded.status;

-- Kontrol
select m.title, count(distinct t.id) as topics, count(distinct b.id) as bundles, count(distinct p.id) as plans
from public.education_modules m
left join public.topics t on t.module_id = m.id
left join public.bundle_packages b on b.module_id = m.id
left join public.pricing_plans p on p.module_id = m.id
group by m.title;
