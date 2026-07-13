-- supabase/migrations/0009_bundle_syllabus.sql
-- Paket bazlı hibrit müfredat: ortak çekirdek + pakete özel haftalar

create table public.bundle_syllabus_weeks (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundle_packages(id) on delete cascade,
  week_number int not null check (week_number >= 1 and week_number <= 52),
  title text not null check (char_length(title) >= 2),
  description text not null default '' check (char_length(description) <= 1000),
  week_kind text not null default 'core' check (week_kind in ('core', 'specialized')),
  source_module_week_id uuid references public.module_syllabus_weeks(id) on delete set null,
  sort_order int not null default 0,
  unique (bundle_id, week_number)
);

alter table public.bundle_syllabus_weeks enable row level security;

-- Public vitrin: aktif paket + aktif modül müfredatı herkese okunur
create policy "bundle_syllabus_select_public" on public.bundle_syllabus_weeks
  for select using (
    public.is_admin()
    or exists (
      select 1
      from public.bundle_packages b
      join public.education_modules m on m.id = b.module_id
      where b.id = bundle_syllabus_weeks.bundle_id
        and b.is_active = true
        and m.is_active = true
    )
  );

create policy "bundle_syllabus_manage_admin" on public.bundle_syllabus_weeks
  for all using (public.is_admin()) with check (public.is_admin());
