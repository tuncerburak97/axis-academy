-- supabase/migrations/0008_module_syllabus.sql
-- Modül haftalık müfredatı + sınıf güncel hafta override

create table public.module_syllabus_weeks (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.education_modules(id) on delete cascade,
  week_number int not null check (week_number >= 1 and week_number <= 104),
  title text not null check (char_length(title) >= 2),
  description text not null default '' check (char_length(description) <= 1000),
  sort_order int not null default 0,
  unique (module_id, week_number)
);

alter table public.module_syllabus_weeks enable row level security;

-- Public vitrin: aktif modül müfredatı herkese okunur
create policy "syllabus_select_public" on public.module_syllabus_weeks
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.education_modules m
      where m.id = module_syllabus_weeks.module_id and m.is_active = true
    )
  );

create policy "syllabus_manage_admin" on public.module_syllabus_weeks
  for all using (public.is_admin()) with check (public.is_admin());

-- Sınıf: admin manuel güncel hafta override (null = otomatik)
alter table public.classes
  add column current_week_override int check (current_week_override is null or current_week_override >= 1);
