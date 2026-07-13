-- supabase/seed_courses.sql
-- Eğitim (sınıf) içerik seed'i: mevcut sınıflara hafta/genel içerik bilgisi,
-- 3 yeni yaklaşan eğitim ve Excel eğitimi için örnek materyaller.
-- Önce migrations 0005 ve seed_education.sql çalıştırılmış olmalı.

-- Mevcut seed sınıflarına hafta sayısı + genel içerik
update public.classes set
  duration_weeks = 10,
  overview = E'Bu eğitim 10 hafta boyunca, haftada bir canlı oturumla ilerler. Her hafta; ders dokümanı, uygulama dosyası ve mini ödev panelinize yüklenir.\n\nProgram sonunda pivot analiz, veri görselleştirme ve dashboard kurulumunu uçtan uca tamamlamış olursunuz. Sorularınız için eğitmenlerimize panel üzerinden her zaman ulaşabilirsiniz.'
where id = 'd0000000-0000-4000-8000-000000000101';

update public.classes set
  duration_weeks = 8,
  overview = E'Tez teslim takvimine göre kurgulanmış 8 haftalık yoğun program. Her hafta bir belge yönetimi konusu, örnek tez dosyaları üzerinde uygulanır.\n\nHaftalık dokümanlar ve kontrol listeleri panelinize eklenir; kendi teziniz üzerinde ilerlersiniz.'
where id = 'd0000000-0000-4000-8000-000000000201';

update public.classes set
  duration_weeks = 8,
  overview = E'8 haftalık uygulamalı atölye: her katılımcı kendi sunumunu program boyunca adım adım dönüştürür.\n\nHaftalık ders notları, örnek desteler ve geri bildirim ödevleri panelinizden takip edilir.'
where id = 'd0000000-0000-4000-8000-000000000301';

-- Yeni yaklaşan eğitimler (tarihleri kendine göre güncelle)
insert into public.classes (id, module_id, title, description, start_date, schedule_note, duration_hours, capacity, status, duration_weeks, overview) values
('d0000000-0000-4000-8000-000000000102', 'e0000000-0000-4000-8000-000000000001', 'Excel Başlangıç — Eylül Dönemi', 'Sıfırdan sağlam temel: formüller, tablolar ve raporlama.', '2026-09-15', 'Salı 19:00-21:00', 16, 15, 'open', 8, E'Excel''e yeni başlayanlar için 8 haftalık temel program. Haftalık dokümanlar ve alıştırma dosyaları panelden paylaşılır.'),
('d0000000-0000-4000-8000-000000000202', 'e0000000-0000-4000-8000-000000000002', 'Word Kurumsal Belgeler — Ekim Dönemi', 'Kurumsal ekipler için şablon ve standart odaklı program.', '2026-10-06', 'Salı ve Perşembe 20:00-21:30', 18, 12, 'open', 6, E'Kurumsal belge standartlarını 6 haftada oturtan program. Şablon dosyaları ve haftalık uygulamalar panelde.'),
('d0000000-0000-4000-8000-000000000302', 'e0000000-0000-4000-8000-000000000003', 'Sunum Tasarımı Yoğunlaştırılmış — Ekim Dönemi', 'Hafta sonu yoğunlaştırılmış sunum tasarımı kampı.', '2026-10-17', 'Cumartesi 10:00-14:00', 16, 10, 'open', 4, E'4 haftalık yoğunlaştırılmış kamp: kurgu, tasarım, veri ve sahne. Tüm materyaller panelden takip edilir.')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  start_date = excluded.start_date,
  schedule_note = excluded.schedule_note,
  duration_hours = excluded.duration_hours,
  capacity = excluded.capacity,
  status = excluded.status,
  duration_weeks = excluded.duration_weeks,
  overview = excluded.overview;

-- Örnek materyaller: "Excel Profesyonel — Ağustos Dönemi" eğitimi
insert into public.class_materials (id, class_id, category, week_number, title, content_md, file_path, sort_order) values
('f0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000101', 'general', null, 'Eğitime Hoş Geldiniz',
E'# Excel Profesyonel Programına Hoş Geldiniz\n\nBu panel üzerinden **tüm ders dokümanlarına**, haftalık içeriklere ve ödevlere ulaşabilirsiniz.\n\n## Nasıl ilerleyeceğiz?\n\n1. Her hafta **Haftalık Ders** sekmesine yeni içerik eklenir.\n2. Uygulama dosyalarını indirip ders öncesi göz atın.\n3. Mini ödevleri bir sonraki derse kadar tamamlayın.\n\n> Sorularınızı ders sonunda ya da panel üzerinden talep açarak iletebilirsiniz.',
null, 1),
('f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000101', 'weekly', 1, 'Hafta 1 — Formül Temelleri ve Hata Ayıklama',
E'## Bu hafta neler işledik?\n\n- Hücre referans tipleri (`A1`, `$A$1`, karışık referans)\n- EĞER, VE/VEYA ile koşullu mantık kurulumu\n- `#YOK`, `#BAŞV!` hatalarının kaynağını bulma\n\n### Ders sonrası yapılacaklar\n\n- [ ] Uygulama dosyasındaki satış tablosunu tamamlayın\n- [ ] Hatalı formül örneklerini düzeltin',
null, 1),
('f0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000101', 'weekly', 2, 'Hafta 2 — Arama Fonksiyonları',
E'## Bu hafta neler işledik?\n\n- DÜŞEYARA''nın sınırları ve ÇAPRAZARA''ya geçiş\n- İNDİS + KAÇINCI ile esnek arama desenleri\n- Yaklaşık ve tam eşleşme senaryoları\n\n### Kaynaklar\n\nUygulama dosyası ders dokümanları arasında paylaşıldı.',
null, 2),
('f0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000101', 'homework', 1, 'Ödev 1 — Satış Raporu Temizliği',
E'## Ödev\n\nEkteki ham satış verisini kullanarak:\n\n1. Tarih kolonunu standart biçime çevirin\n2. Mükerrer kayıtları temizleyin\n3. Bölge bazlı özet tabloyu formüllerle kurun\n\n**Teslim:** Bir sonraki ders başına kadar. Dosyanızı ders sırasında birlikte inceleyeceğiz.',
null, 1),
('f0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000101', 'note', null, 'Eğitmen Notu — Kısayol Listesi',
E'## Derste en çok kullandığımız kısayollar\n\n| Kısayol | İşlev |\n|---|---|\n| `Ctrl + T` | Tabloya çevir |\n| `Ctrl + Shift + L` | Filtre aç/kapat |\n| `F4` | Referans kilitle |\n| `Alt + =` | Otomatik toplam |\n\nListenin tamamı haftalık dokümanlarla birlikte güncellenecek.',
null, 1)
on conflict (id) do update set
  category = excluded.category,
  week_number = excluded.week_number,
  title = excluded.title,
  content_md = excluded.content_md,
  sort_order = excluded.sort_order;

-- Kontrol
select c.title, c.duration_weeks, count(m.id) as materials
from public.classes c
left join public.class_materials m on m.class_id = c.id
group by c.title, c.duration_weeks
order by c.title;
