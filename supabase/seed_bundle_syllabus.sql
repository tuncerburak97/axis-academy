-- supabase/seed_bundle_syllabus.sql
-- Hibrit paket müfredatı: modül haftalarından çekirdek + uzmanlaşma seçimi
-- Önkoşul: seed_education.sql + seed_syllabus.sql çalışmış olmalı

-- Yardımcı: modül haftalarını pakete kopyala
-- Excel Başlangıç — 4 hafta çekirdek
insert into public.bundle_syllabus_weeks (bundle_id, week_number, title, description, week_kind, source_module_week_id, sort_order)
select
  'b0000000-0000-4000-8000-000000000101',
  m.week_number,
  m.title,
  m.description,
  'core',
  m.id,
  m.sort_order
from public.module_syllabus_weeks m
where m.module_id = 'e0000000-0000-4000-8000-000000000001' and m.week_number between 1 and 4
on conflict (bundle_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  week_kind = excluded.week_kind,
  source_module_week_id = excluded.source_module_week_id,
  sort_order = excluded.sort_order;

-- Excel Profesyonel — 4 çekirdek + 3 uzmanlaşma (modül 5-7)
insert into public.bundle_syllabus_weeks (bundle_id, week_number, title, description, week_kind, source_module_week_id, sort_order)
select
  'b0000000-0000-4000-8000-000000000102',
  m.week_number,
  m.title,
  m.description,
  case when m.week_number <= 4 then 'core' else 'specialized' end,
  m.id,
  m.sort_order
from public.module_syllabus_weeks m
where m.module_id = 'e0000000-0000-4000-8000-000000000001' and m.week_number between 1 and 7
on conflict (bundle_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  week_kind = excluded.week_kind,
  source_module_week_id = excluded.source_module_week_id,
  sort_order = excluded.sort_order;

-- Excel Kurumsal — 4 çekirdek + 6 uzmanlaşma (modül 5-10)
insert into public.bundle_syllabus_weeks (bundle_id, week_number, title, description, week_kind, source_module_week_id, sort_order)
select
  'b0000000-0000-4000-8000-000000000103',
  m.week_number,
  m.title,
  m.description,
  case when m.week_number <= 4 then 'core' else 'specialized' end,
  m.id,
  m.sort_order
from public.module_syllabus_weeks m
where m.module_id = 'e0000000-0000-4000-8000-000000000001' and m.week_number between 1 and 10
on conflict (bundle_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  week_kind = excluded.week_kind,
  source_module_week_id = excluded.source_module_week_id,
  sort_order = excluded.sort_order;

-- Word Başlangıç — 3 hafta çekirdek
insert into public.bundle_syllabus_weeks (bundle_id, week_number, title, description, week_kind, source_module_week_id, sort_order)
select
  'b0000000-0000-4000-8000-000000000201',
  m.week_number,
  m.title,
  m.description,
  'core',
  m.id,
  m.sort_order
from public.module_syllabus_weeks m
where m.module_id = 'e0000000-0000-4000-8000-000000000002' and m.week_number between 1 and 3
on conflict (bundle_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  week_kind = excluded.week_kind,
  source_module_week_id = excluded.source_module_week_id,
  sort_order = excluded.sort_order;

-- Word Tez Yazım — 3 çekirdek + 3 uzmanlaşma (modül 4-6)
insert into public.bundle_syllabus_weeks (bundle_id, week_number, title, description, week_kind, source_module_week_id, sort_order)
select
  'b0000000-0000-4000-8000-000000000202',
  m.week_number,
  m.title,
  m.description,
  case when m.week_number <= 3 then 'core' else 'specialized' end,
  m.id,
  m.sort_order
from public.module_syllabus_weeks m
where m.module_id = 'e0000000-0000-4000-8000-000000000002' and m.week_number between 1 and 6
on conflict (bundle_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  week_kind = excluded.week_kind,
  source_module_week_id = excluded.source_module_week_id,
  sort_order = excluded.sort_order;

-- Word Kurumsal Belge — 3 çekirdek + 5 uzmanlaşma (modül 4-8)
insert into public.bundle_syllabus_weeks (bundle_id, week_number, title, description, week_kind, source_module_week_id, sort_order)
select
  'b0000000-0000-4000-8000-000000000203',
  m.week_number,
  m.title,
  m.description,
  case when m.week_number <= 3 then 'core' else 'specialized' end,
  m.id,
  m.sort_order
from public.module_syllabus_weeks m
where m.module_id = 'e0000000-0000-4000-8000-000000000002' and m.week_number between 1 and 8
on conflict (bundle_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  week_kind = excluded.week_kind,
  source_module_week_id = excluded.source_module_week_id,
  sort_order = excluded.sort_order;

-- PowerPoint Temelleri — 3 hafta çekirdek
insert into public.bundle_syllabus_weeks (bundle_id, week_number, title, description, week_kind, source_module_week_id, sort_order)
select
  'b0000000-0000-4000-8000-000000000301',
  m.week_number,
  m.title,
  m.description,
  'core',
  m.id,
  m.sort_order
from public.module_syllabus_weeks m
where m.module_id = 'e0000000-0000-4000-8000-000000000003' and m.week_number between 1 and 3
on conflict (bundle_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  week_kind = excluded.week_kind,
  source_module_week_id = excluded.source_module_week_id,
  sort_order = excluded.sort_order;

-- PowerPoint Profesyonel — 3 çekirdek + 3 uzmanlaşma (modül 4-6)
insert into public.bundle_syllabus_weeks (bundle_id, week_number, title, description, week_kind, source_module_week_id, sort_order)
select
  'b0000000-0000-4000-8000-000000000302',
  m.week_number,
  m.title,
  m.description,
  case when m.week_number <= 3 then 'core' else 'specialized' end,
  m.id,
  m.sort_order
from public.module_syllabus_weeks m
where m.module_id = 'e0000000-0000-4000-8000-000000000003' and m.week_number between 1 and 6
on conflict (bundle_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  week_kind = excluded.week_kind,
  source_module_week_id = excluded.source_module_week_id,
  sort_order = excluded.sort_order;

-- PowerPoint Kurumsal Marka — 3 çekirdek + 5 uzmanlaşma (modül 4-8)
insert into public.bundle_syllabus_weeks (bundle_id, week_number, title, description, week_kind, source_module_week_id, sort_order)
select
  'b0000000-0000-4000-8000-000000000303',
  m.week_number,
  m.title,
  m.description,
  case when m.week_number <= 3 then 'core' else 'specialized' end,
  m.id,
  m.sort_order
from public.module_syllabus_weeks m
where m.module_id = 'e0000000-0000-4000-8000-000000000003' and m.week_number between 1 and 8
on conflict (bundle_id, week_number) do update set
  title = excluded.title,
  description = excluded.description,
  week_kind = excluded.week_kind,
  source_module_week_id = excluded.source_module_week_id,
  sort_order = excluded.sort_order;
