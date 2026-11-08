-- supabase/seed_local_dev.sql
-- YALNIZCA YEREL GELİŞTİRME: `supabase start` / `supabase db reset` ile çalışır, canlıya uygulanmaz.
-- Test hesapları (yalnızca localhost'taki yerel Supabase'de geçerli):
--   admin@axis.test  / AxisDev!2026   → admin
--   uye@axis.test    / AxisDev!2026   → üye
--   uye2@axis.test   / AxisDev!2026   → üye

do $$
declare
  seed_users jsonb := '[
    {"id": "a0000000-0000-4000-8000-000000000001", "email": "admin@axis.test", "name": "Selin Aksoy"},
    {"id": "a0000000-0000-4000-8000-000000000002", "email": "uye@axis.test", "name": "Elif Demir"},
    {"id": "a0000000-0000-4000-8000-000000000003", "email": "uye2@axis.test", "name": "Ahmet Kaya"}
  ]';
  item jsonb;
  uid uuid;
begin
  for item in select * from jsonb_array_elements(seed_users) loop
    uid := (item->>'id')::uuid;
    if not exists (select 1 from auth.users where id = uid) then
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        item->>'email', crypt('AxisDev!2026', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', item->>'name'),
        now(), now(), '', '', '', ''
      );
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (
        gen_random_uuid(), uid, uid::text,
        jsonb_build_object('sub', uid::text, 'email', item->>'email', 'email_verified', true),
        'email', now(), now(), now()
      );
    end if;
  end loop;
end $$;

update public.profiles set role = 'admin' where user_id = 'a0000000-0000-4000-8000-000000000001';

-- ------------------------------------------------------------
-- Ek demo üyeler (dolu dönem ve kontenjan görünümü için)
-- ------------------------------------------------------------
do $$
declare
  names text[] := array['Zeynep Aydın','Murat Şahin','Ayşe Toprak','Can Yıldız','Deniz Arslan','Ece Koç','Burak Öztürk','Selin Erdem','Kaan Polat','Merve Güneş'];
  i int;
  uid uuid;
begin
  for i in 1..array_length(names, 1) loop
    uid := ('a0000000-0000-4000-8000-0000000001' || lpad(i::text, 2, '0'))::uuid;
    if not exists (select 1 from auth.users where id = uid) then
      insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
      values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        'demo' || i || '@axis.test', crypt('AxisDev!2026', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', names[i]),
        now() - (i || ' days')::interval, now(), '', '', '', '');
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', 'demo' || i || '@axis.test', 'email_verified', true), 'email', now(), now(), now());
    end if;
  end loop;
end $$;

update public.profiles set role = 'instructor' where user_id = 'a0000000-0000-4000-8000-000000000110';

-- ------------------------------------------------------------
-- Dönem tarihlerini bugüne göre konumlandır
-- ------------------------------------------------------------
update public.classes set start_date = current_date - 21, price = 4250, schedule_note = 'Salı 19:00–21:00', meeting_url = 'https://meet.example.com/axis-excel', instructor_id = 'a0000000-0000-4000-8000-000000000110' where id = 'd0000000-0000-4000-8000-000000000101';
update public.classes set start_date = current_date + 10, price = 3900, schedule_note = 'Cumartesi 10:00–13:00' where id = 'd0000000-0000-4000-8000-000000000102';
update public.classes set start_date = current_date + 17, price = 5000, schedule_note = 'Salı-Perşembe 20:00–21:30' where id = 'd0000000-0000-4000-8000-000000000201';
update public.classes set start_date = current_date + 24, price = 3900, schedule_note = 'Çarşamba 19:00–21:00', capacity = 6 where id = 'd0000000-0000-4000-8000-000000000202';
update public.classes set start_date = current_date - 70, price = 5000, schedule_note = 'Pazartesi 19:00–21:00' where id = 'd0000000-0000-4000-8000-000000000301';
update public.classes set start_date = current_date + 31, price = 5000, schedule_note = 'Pazar 11:00–14:00' where id = 'd0000000-0000-4000-8000-000000000302';

-- Kayıtlar
insert into public.class_enrollments (class_id, user_id, status, created_at) values
  ('d0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000000002', 'enrolled', now() - interval '30 days'),
  ('d0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000000101', 'enrolled', now() - interval '29 days'),
  ('d0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000000102', 'enrolled', now() - interval '28 days'),
  ('d0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000000103', 'enrolled', now() - interval '27 days'),
  ('d0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000002', 'enrolled', now() - interval '80 days'),
  ('d0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000104', 'enrolled', now() - interval '80 days'),
  ('d0000000-0000-4000-8000-000000000102', 'a0000000-0000-4000-8000-000000000003', 'pending', now() - interval '2 hours'),
  ('d0000000-0000-4000-8000-000000000102', 'a0000000-0000-4000-8000-000000000105', 'pending', now() - interval '26 hours'),
  ('d0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000101', 'enrolled', now() - interval '6 days'),
  ('d0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000102', 'enrolled', now() - interval '6 days'),
  ('d0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000103', 'enrolled', now() - interval '5 days'),
  ('d0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000104', 'enrolled', now() - interval '5 days'),
  ('d0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000106', 'enrolled', now() - interval '4 days'),
  ('d0000000-0000-4000-8000-000000000201', 'a0000000-0000-4000-8000-000000000107', 'enrolled', now() - interval '3 days'),
  ('d0000000-0000-4000-8000-000000000201', 'a0000000-0000-4000-8000-000000000108', 'enrolled', now() - interval '3 days')
on conflict do nothing;

-- Geçmiş dönemi tamamla: sertifika üretimi complete_class ile aynı mantık (admin oturumu olmadan elle)
update public.class_enrollments set status = 'completed' where class_id = 'd0000000-0000-4000-8000-000000000301';
update public.classes set status = 'completed', completed_at = now() - interval '10 days' where id = 'd0000000-0000-4000-8000-000000000301';
insert into public.certificates (code, user_id, class_id, recipient_name, program_title, hours, issued_at) values
  ('AX-26-DEMO01', 'a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000301', 'Elif Demir', 'PowerPoint ile Etkileyici Sunum', 24, now() - interval '10 days')
on conflict do nothing;

-- Oturumlar: devam eden Excel dönemi, haftada bir
insert into public.sessions (class_id, title, week_number, starts_at, ends_at, location, meeting_url)
select 'd0000000-0000-4000-8000-000000000101',
       coalesce(w.title, 'Hafta ' || g),
       g,
       ((current_date - 21) + (g - 1) * 7 + time '19:00') at time zone 'Europe/Istanbul',
       ((current_date - 21) + (g - 1) * 7 + time '21:00') at time zone 'Europe/Istanbul',
       'Online', 'https://meet.example.com/axis-excel'
from generate_series(1, 10) g
left join public.module_syllabus_weeks w on w.module_id = 'e0000000-0000-4000-8000-000000000001' and w.week_number = g
where not exists (select 1 from public.sessions s where s.class_id = 'd0000000-0000-4000-8000-000000000101');

-- Talepler
insert into public.requests (id, user_id, kind, title, details, message, status, quote_amount, quote_note, quote_valid_until, quoted_at, due_date, created_at, last_activity_at) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'thesis', 'Tez düzenleme · 142 sayfa',
   '{"pages": 142, "institute": "Sağlık Bilimleri Enstitüsü", "style": "APA 7", "deadline": "2026-12-15"}', 'Kaynakça ve tablo numaralandırması karışık durumda.',
   'quoted', 9500, 'Biçim, kaynakça (APA 7), tablo/şekil listeleri ve enstitü şablonuna uyum dahil. 5 iş gününde teslim.', current_date + 2, now() - interval '1 day', null, now() - interval '3 days', now() - interval '1 day'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'analysis', 'İstatistiksel analiz · SPSS regresyon',
   '{"method": "statistical", "software": "SPSS", "sample": 412, "deadline": "2026-11-28"}', 'Anket verim hazır, hipotez testleri ve regresyon gerekiyor.',
   'in_progress', 7000, 'Tanımlayıcı istatistikler, güvenilirlik analizi, çoklu regresyon ve raporlama.', null, now() - interval '12 days', current_date + 5, now() - interval '15 days', now() - interval '2 hours'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'analysis', 'Bibliyometrik analiz · Scopus',
   '{"method": "bibliometric", "database": "Scopus", "topic": "Dijital sağlık okuryazarlığı"}', 'Son 10 yılın yayınları için ortak yazar ve anahtar kelime ağı istiyorum.',
   'received', null, '', null, null, null, now() - interval '26 hours', now() - interval '26 hours'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', 'corporate', 'Kurumsal eğitim · 18 kişi',
   '{"company": "Örnek Lojistik A.Ş.", "headcount": 18, "programs": ["excel"], "format": "Yerinde"}', 'Finans ekibimiz için ileri Excel eğitimi planlıyoruz.',
   'received', null, '', null, null, null, now() - interval '5 hours', now() - interval '5 hours')
on conflict do nothing;

insert into public.requests (id, user_id, kind, training_mode, module_id, topic_ids, total_hours, title, message, status, price_estimate, created_at, last_activity_at, progress_note)
select 'c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'training', 'custom', 'e0000000-0000-4000-8000-000000000002',
       (select array_agg(id) from (select id from public.topics where module_id = 'e0000000-0000-4000-8000-000000000002' limit 3) t),
       6, 'Birebir Word · 6 saat', 'Tezimin şablonunu kendim kurmak istiyorum.', 'planned', 4500, now() - interval '9 days', now() - interval '4 days',
       'Üç oturum planlandı. İlk derste stil mimarisini kuracağız.'
where not exists (select 1 from public.requests where id = 'c0000000-0000-4000-8000-000000000005');

insert into public.sessions (request_id, title, starts_at, ends_at, location, meeting_url)
select 'c0000000-0000-4000-8000-000000000005', t.title, t.starts_at, t.starts_at + interval '2 hours', 'Online', 'https://meet.example.com/axis-word-birebir'
from (values
  ('Stil mimarisi ve şablon', ((current_date + 2) + time '18:00') at time zone 'Europe/Istanbul'),
  ('Otomatik listeler ve numaralandırma', ((current_date + 9) + time '18:00') at time zone 'Europe/Istanbul'),
  ('Kaynakça yönetimi', ((current_date + 16) + time '18:00') at time zone 'Europe/Istanbul')
) as t(title, starts_at)
where not exists (select 1 from public.sessions s where s.request_id = 'c0000000-0000-4000-8000-000000000005');

insert into public.request_messages (request_id, author_id, is_staff, body, created_at)
select * from (values
  ('c0000000-0000-4000-8000-000000000002'::uuid, 'a0000000-0000-4000-8000-000000000002'::uuid, false, 'Merhaba, veri setimi ekledim. Ölçeklerden ikisi ters kodlu, bilginize.', now() - interval '14 days'),
  ('c0000000-0000-4000-8000-000000000002'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, true, 'Teşekkürler Elif Hanım, ters kodlamayı not aldık. Güvenilirlik analizini bitirdik, regresyon modeline geçiyoruz.', now() - interval '2 hours'),
  ('c0000000-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, true, 'Dosyanızı inceledik. Teklifimiz panelinizde, sorunuz olursa buradan yazabilirsiniz.', now() - interval '1 day')
) as v(request_id, author_id, is_staff, body, created_at)
where not exists (select 1 from public.request_messages);

-- Yorumlar
insert into public.reviews (user_id, module_id, class_id, rating, comment, is_published, created_at) values
  ('a0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000301', 5, 'Tez savunma sunumumu bu eğitimden sonra baştan kurdum. Her hafta kendi slaytlarım üzerinden geri bildirim almak çok değerliydi.', true, now() - interval '9 days'),
  ('a0000000-0000-4000-8000-000000000104', 'e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000301', 4, 'Asıl slayt ve şablon kısmı tam ihtiyacım olan şeydi. Biraz daha uygulama süresi olabilirdi.', true, now() - interval '8 days')
on conflict do nothing;

-- Blog
insert into public.posts (slug, title, excerpt, body_md, tags, reading_minutes, is_published, published_at) values
  ('tez-kaynakcasinda-en-sik-yapilan-7-hata', 'Tez kaynakçasında en sık yapılan 7 hata',
   'Enstitü kontrolünden geri dönen tezlerin çoğu aynı yerden takılıyor: kaynakça. İşte en sık gördüğümüz hatalar ve çözümleri.',
   E'## 1. Metin içi atıf ile kaynakça eşleşmiyor\n\nMetinde geçen her kaynak kaynakçada, kaynakçadaki her kaynak metinde olmalı. Word''ün kaynak yöneticisi ya da Zotero bu eşleşmeyi otomatik tutar.\n\n## 2. Stil karışıklığı\n\nAPA 7 ile APA 6 kuralları aynı belgede karışabiliyor. Özellikle DOI biçimi ve yayıncı konumu sık hata kaynağı.\n\n## 3. Asılı girinti eksik\n\nKaynakça girdileri 1,27 cm asılı girintiyle yazılır. Bunu elle boşluk vererek değil, paragraf ayarından yapın.',
   array['tez', 'kaynakça'], 4, true, now() - interval '6 days'),
  ('pivot-tablo-ile-10-dakikada-rapor', 'Pivot tablo ile 10 dakikada aylık rapor',
   'Binlerce satırlık satış verisini tek bir pivot tabloyla yönetime sunulacak bir özete dönüştürmenin adımları.',
   E'## Veriyi tabloya çevirin\n\nCtrl+T ile veriyi Excel tablosuna dönüştürmek, yeni satırlar eklendiğinde pivotun otomatik güncellenmesini sağlar.\n\n## Doğru alanları seçin\n\nSatırlara ürün grubu, sütunlara ay, değerlere satış tutarı. Bu kadar.',
   array['excel'], 3, true, now() - interval '13 days'),
  ('bibliyometrik-analiz-nedir', 'Bibliyometrik analiz nedir, ne zaman gerekir?',
   'Literatür taramanızı sayılarla desteklemenin yolu: bibliyometrik analizle alanınızın haritasını çıkarın.',
   E'Bibliyometrik analiz, bir alandaki yayınları yazar, kurum, anahtar kelime ve atıf ilişkileri üzerinden inceler.\n\n## Ne zaman işinize yarar?\n\n- Tez ya da makalede literatürün gelişimini göstermek istediğinizde\n- Alanınızdaki etkili yazar ve dergileri belirlemek istediğinizde',
   array['analiz'], 5, true, now() - interval '20 days')
on conflict (slug) do nothing;

insert into public.discount_codes (code, description, percent, valid_until, max_uses) values
  ('AXIS10', 'Yeni üyelere %10', 10, current_date + 60, 100),
  ('KURUMSAL15', 'Kurumsal iş birlikleri', 15, null, null)
on conflict (code) do nothing;
