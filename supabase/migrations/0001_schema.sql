-- supabase/migrations/0001_schema.sql
-- Axis Academy Phase 1 schema: tables, RLS policies, atomic class enrollment function
-- Naming convention: all identifiers and enum values in English; UI renders Turkish labels.

-- ============================================================
-- Helper: admin check (used by RLS policies)
-- SECURITY DEFINER: reads role without tripping RLS on profiles
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- profiles — 1:1 with auth.users; role lives here
-- ============================================================
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id or public.is_admin());

create policy "profiles_update_own_except_role" on public.profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id and role = 'user');

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- Auto-create a profile row for each new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- site_content — admin-managed public page content
-- ============================================================
create table public.site_content (
  page_key text not null,
  section_key text not null,
  content_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (page_key, section_key)
);

alter table public.site_content enable row level security;

create policy "site_content_select_all" on public.site_content
  for select using (true);

create policy "site_content_manage_admin" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- settings — e.g. hourly rate for custom training requests
-- ============================================================
create table public.settings (
  key text primary key,
  value_json jsonb not null
);

alter table public.settings enable row level security;

create policy "settings_select_authenticated" on public.settings
  for select using (auth.role() = 'authenticated');

create policy "settings_manage_admin" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.settings (key, value_json)
values ('hourly_rate', '{"amount": 400, "currency": "TRY"}'::jsonb);

-- ============================================================
-- Training catalog: modules / bundle packages / topic pool
-- ============================================================
create table public.education_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('excel', 'word', 'powerpoint')),
  description text not null default '',
  public_price_hint text not null default '',  -- e.g. "800TL'den baslayan fiyatlarla" (visible to anon)
  is_active boolean not null default true,
  sort_order int not null default 0
);

alter table public.education_modules enable row level security;

-- Anyone (incl. anon) can read active module intros (public training page)
create policy "modules_select_active" on public.education_modules
  for select using (is_active = true or public.is_admin());

create policy "modules_manage_admin" on public.education_modules
  for all using (public.is_admin()) with check (public.is_admin());

create table public.bundle_packages (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.education_modules(id) on delete cascade,
  title text not null,
  description text not null default '',
  fixed_price numeric(10, 2) not null,
  duration_hours int not null,
  is_active boolean not null default true
);

alter table public.bundle_packages enable row level security;

-- Detailed pricing is only visible to signed-in users
create policy "bundles_select_authenticated" on public.bundle_packages
  for select using (auth.role() = 'authenticated' and (is_active = true or public.is_admin()));

create policy "bundles_manage_admin" on public.bundle_packages
  for all using (public.is_admin()) with check (public.is_admin());

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.education_modules(id) on delete cascade,
  title text not null,
  description text not null default '',
  estimated_hours int not null default 1,
  is_active boolean not null default true
);

alter table public.topics enable row level security;

create policy "topics_select_authenticated" on public.topics
  for select using (auth.role() = 'authenticated' and (is_active = true or public.is_admin()));

create policy "topics_manage_admin" on public.topics
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Classes, pricing tiers, enrollments
-- ============================================================
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.education_modules(id) on delete cascade,
  title text not null,
  description text not null default '',
  start_date date not null,
  schedule_note text not null default '',      -- free text, e.g. "Sali-Persembe 20:00"
  duration_hours int not null,
  capacity int not null check (capacity > 0),
  status text not null default 'open' check (status in ('open', 'full', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.classes enable row level security;

create policy "classes_select_authenticated" on public.classes
  for select using (auth.role() = 'authenticated');

create policy "classes_manage_admin" on public.classes
  for all using (public.is_admin()) with check (public.is_admin());

create table public.class_pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.education_modules(id) on delete cascade,
  min_people int not null,
  max_people int not null,
  price_per_person numeric(10, 2) not null,    -- TOTAL price per person for the class
  check (min_people <= max_people)
);

alter table public.class_pricing_tiers enable row level security;

create policy "tiers_select_authenticated" on public.class_pricing_tiers
  for select using (auth.role() = 'authenticated');

create policy "tiers_manage_admin" on public.class_pricing_tiers
  for all using (public.is_admin()) with check (public.is_admin());

create table public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  status text not null default 'enrolled' check (status in ('enrolled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (class_id, user_id)
);

alter table public.class_enrollments enable row level security;

create policy "enrollments_select_own" on public.class_enrollments
  for select using (auth.uid() = user_id or public.is_admin());

create policy "enrollments_manage_admin" on public.class_enrollments
  for all using (public.is_admin()) with check (public.is_admin());
-- Note: users have no INSERT policy; enrollment happens only via enroll_in_class()

-- Atomic enrollment: capacity check + insert in one transaction (prevents race conditions)
create or replace function public.enroll_in_class(p_class_id uuid)
returns public.class_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.classes%rowtype;
  v_active_count int;
  v_enrollment public.class_enrollments;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  -- Lock the class row: concurrent enrollments are processed sequentially
  select * into v_class from public.classes where id = p_class_id for update;

  if not found or v_class.status <> 'open' then
    raise exception 'CLASS_NOT_OPEN';
  end if;

  select count(*) into v_active_count
  from public.class_enrollments
  where class_id = p_class_id and status <> 'cancelled';

  if v_active_count >= v_class.capacity then
    update public.classes set status = 'full' where id = p_class_id;
    raise exception 'CLASS_FULL';
  end if;

  insert into public.class_enrollments (class_id, user_id)
  values (p_class_id, auth.uid())
  returning * into v_enrollment;

  -- Mark class as full when the last seat is taken
  if v_active_count + 1 >= v_class.capacity then
    update public.classes set status = 'full' where id = p_class_id;
  end if;

  return v_enrollment;
end;
$$;

-- ============================================================
-- Individual training requests (bundle or custom module)
-- ============================================================
create table public.individual_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  request_type text not null check (request_type in ('bundle', 'custom')),
  module_id uuid not null references public.education_modules(id),
  bundle_id uuid references public.bundle_packages(id),
  topic_ids uuid[] not null default '{}',
  total_hours int,
  calculated_price numeric(10, 2) not null,    -- recomputed server-side in the Server Action
  status text not null default 'received'
    check (status in ('received', 'planned', 'in_progress', 'completed', 'cancelled')),
  progress_note text not null default '',      -- progress note visible to the user
  admin_notes text not null default '',        -- admin-only notes
  created_at timestamptz not null default now()
);

alter table public.individual_requests enable row level security;

create policy "individual_requests_select_own" on public.individual_requests
  for select using (auth.uid() = user_id or public.is_admin());

create policy "individual_requests_insert_own" on public.individual_requests
  for insert with check (auth.uid() = user_id);

create policy "individual_requests_update_admin" on public.individual_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Analysis / thesis editing requests (manual admin workflow)
-- ============================================================
create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  service_type text not null check (service_type in ('analysis', 'thesis')),
  message text not null,
  file_path text,                              -- path inside private 'request-files' bucket
  status text not null default 'new'
    check (status in ('new', 'contacted', 'in_progress', 'completed')),
  admin_notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;

create policy "contact_requests_select_own" on public.contact_requests
  for select using (auth.uid() = user_id or public.is_admin());

create policy "contact_requests_insert_own" on public.contact_requests
  for insert with check (auth.uid() = user_id);

create policy "contact_requests_update_admin" on public.contact_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Storage: create the PRIVATE bucket 'request-files' in the dashboard first,
-- then these policies grant owner + admin access.
-- Path layout: {user_id}/{filename}
-- ============================================================
create policy "storage_insert_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'request-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_select_own_or_admin" on storage.objects
  for select using (
    bucket_id = 'request-files'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
