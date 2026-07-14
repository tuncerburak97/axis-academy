-- supabase/migrations/0012_public_all_upcoming_classes.sql
-- Public ana sayfa hero: tüm modüllerden yaklaşan sınıflar + modül detay için zengin alanlar

create or replace function public.get_public_all_upcoming_classes()
returns table (
  id uuid,
  title text,
  start_date date,
  schedule_note text,
  duration_hours int,
  capacity int,
  approved_count bigint,
  module_id uuid,
  module_title text,
  module_category text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id,
    c.title,
    c.start_date,
    c.schedule_note,
    c.duration_hours,
    c.capacity,
    (
      select count(*)
      from public.class_enrollments e
      where e.class_id = c.id and e.status not in ('pending', 'cancelled')
    ) as approved_count,
    m.id as module_id,
    m.title as module_title,
    m.category as module_category
  from public.classes c
  join public.education_modules m on m.id = c.module_id
  where c.status = 'open'
    and c.start_date >= current_date
    and m.is_active = true
  order by c.start_date
  limit 12;
$$;

grant execute on function public.get_public_all_upcoming_classes() to anon;
grant execute on function public.get_public_all_upcoming_classes() to authenticated;

-- Modül detay: kontenjan aciliyeti için genişletilmiş alanlar
-- Dönüş tipi değiştiği için önce eski imzayı kaldır (CREATE OR REPLACE yeterli değil)
drop function if exists public.get_public_upcoming_classes(uuid);

create or replace function public.get_public_upcoming_classes(p_module_id uuid)
returns table (
  id uuid,
  title text,
  start_date date,
  schedule_note text,
  duration_hours int,
  duration_weeks int,
  capacity int,
  approved_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id,
    c.title,
    c.start_date,
    c.schedule_note,
    c.duration_hours,
    c.duration_weeks,
    c.capacity,
    (
      select count(*)
      from public.class_enrollments e
      where e.class_id = c.id and e.status not in ('pending', 'cancelled')
    ) as approved_count
  from public.classes c
  where c.module_id = p_module_id
    and c.status = 'open'
    and c.start_date >= current_date
  order by c.start_date
  limit 6;
$$;

grant execute on function public.get_public_upcoming_classes(uuid) to anon;
grant execute on function public.get_public_upcoming_classes(uuid) to authenticated;
