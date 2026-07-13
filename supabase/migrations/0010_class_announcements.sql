-- supabase/migrations/0010_class_announcements.sql
-- Sınıf duyuruları: yalnızca kayıtlı öğrenciler panelde görür

create table public.class_announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null check (char_length(title) >= 2 and char_length(title) <= 200),
  body text not null default '' check (char_length(body) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index class_announcements_class_id_idx on public.class_announcements (class_id, created_at desc);

alter table public.class_announcements enable row level security;

create policy "announcements_select_enrolled" on public.class_announcements
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.class_enrollments e
      where e.class_id = class_announcements.class_id
        and e.user_id = auth.uid()
        and e.status not in ('pending', 'cancelled')
    )
  );

create policy "announcements_manage_admin" on public.class_announcements
  for all using (public.is_admin()) with check (public.is_admin());
