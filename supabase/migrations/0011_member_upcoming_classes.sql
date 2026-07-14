-- supabase/migrations/0011_member_upcoming_classes.sql
-- Üye paneli Keşfet hero: tüm aktif modüllerdeki yaklaşan açık sınıflar (tek sorgu)

create or replace function public.get_member_upcoming_classes()
returns table (
  id uuid,
  title text,
  description text,
  start_date date,
  schedule_note text,
  duration_hours int,
  capacity int,
  approved_count bigint,
  my_status text,
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
    c.description,
    c.start_date,
    c.schedule_note,
    c.duration_hours,
    c.capacity,
    (
      select count(*)
      from public.class_enrollments e
      where e.class_id = c.id and e.status not in ('pending', 'cancelled')
    ) as approved_count,
    (
      select e.status
      from public.class_enrollments e
      where e.class_id = c.id and e.user_id = auth.uid()
    ) as my_status,
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

revoke execute on function public.get_member_upcoming_classes() from anon;
