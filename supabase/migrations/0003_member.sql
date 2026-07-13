-- supabase/migrations/0003_member.sql
-- Member discovery helper: open classes with real seat counts.
-- RLS hides other users' enrollments, so counting must happen with
-- SECURITY DEFINER; the function returns aggregates only (no personal data).

create or replace function public.get_open_classes(p_module_id uuid)
returns table (
  id uuid,
  title text,
  description text,
  start_date date,
  schedule_note text,
  duration_hours int,
  capacity int,
  approved_count bigint,
  my_status text
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
    ) as my_status
  from public.classes c
  where c.module_id = p_module_id and c.status = 'open'
  order by c.start_date;
$$;

revoke execute on function public.get_open_classes(uuid) from anon;
