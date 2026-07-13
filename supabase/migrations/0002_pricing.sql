-- supabase/migrations/0002_pricing.sql
-- Dynamic pricing rework: unified pricing_plans, richer module cards,
-- admin-approved class enrollment flow.

-- ============================================================
-- education_modules: richer public card/detail fields
-- ============================================================
alter table public.education_modules
  add column long_description text not null default '',
  add column features text[] not null default '{}',
  add column badge text not null default '';

-- ============================================================
-- pricing_plans — unified pricing matrix, fully admin-managed
-- Individual hourly rate = (training_type='individual', unit='per_hour')
-- ============================================================
create table public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.education_modules(id) on delete cascade,
  training_type text not null check (training_type in ('individual', 'group')),
  min_people int not null default 1 check (min_people >= 1),
  max_people int not null default 1,
  price numeric(10, 2) not null,
  unit text not null check (unit in ('per_hour', 'total')),
  note text not null default '',
  is_active boolean not null default true,
  sort_order int not null default 0,
  check (min_people <= max_people)
);

alter table public.pricing_plans enable row level security;

-- Detailed pricing stays members-only; the public side only sees public_price_hint
create policy "pricing_plans_select_authenticated" on public.pricing_plans
  for select using (auth.role() = 'authenticated' and (is_active = true or public.is_admin()));

create policy "pricing_plans_manage_admin" on public.pricing_plans
  for all using (public.is_admin()) with check (public.is_admin());

-- Superseded structures
drop table public.class_pricing_tiers;
delete from public.settings where key = 'hourly_rate';

-- ============================================================
-- bundle_packages: now publicly readable (showcased in the public
-- "example packages" popup); admin curates the content
-- ============================================================
drop policy "bundles_select_authenticated" on public.bundle_packages;

create policy "bundles_select_active" on public.bundle_packages
  for select using (is_active = true or public.is_admin());

-- ============================================================
-- class_enrollments: joining requires admin approval
-- Flow: user requests (pending) -> admin approves (enrolled) or rejects (cancelled)
-- ============================================================
alter table public.class_enrollments drop constraint class_enrollments_status_check;
alter table public.class_enrollments
  add constraint class_enrollments_status_check
  check (status in ('pending', 'enrolled', 'in_progress', 'completed', 'cancelled'));
alter table public.class_enrollments alter column status set default 'pending';

drop function public.enroll_in_class(uuid);

-- User side: create a pending join request (no capacity consumed yet)
create or replace function public.request_class_enrollment(p_class_id uuid)
returns public.class_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_enrollment public.class_enrollments;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select status into v_status from public.classes where id = p_class_id;
  if not found or v_status <> 'open' then
    raise exception 'CLASS_NOT_OPEN';
  end if;

  insert into public.class_enrollments (class_id, user_id, status)
  values (p_class_id, auth.uid(), 'pending')
  returning * into v_enrollment;

  return v_enrollment;
exception
  when unique_violation then
    raise exception 'ALREADY_REQUESTED';
end;
$$;

-- Admin side: approve with atomic capacity check
create or replace function public.approve_class_enrollment(p_enrollment_id uuid)
returns public.class_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment public.class_enrollments%rowtype;
  v_class public.classes%rowtype;
  v_approved_count int;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  select * into v_enrollment from public.class_enrollments where id = p_enrollment_id for update;
  if not found or v_enrollment.status <> 'pending' then
    raise exception 'ENROLLMENT_NOT_PENDING';
  end if;

  -- Lock the class row: concurrent approvals are processed sequentially
  select * into v_class from public.classes where id = v_enrollment.class_id for update;

  select count(*) into v_approved_count
  from public.class_enrollments
  where class_id = v_class.id and status not in ('pending', 'cancelled');

  if v_approved_count >= v_class.capacity then
    update public.classes set status = 'full' where id = v_class.id;
    raise exception 'CLASS_FULL';
  end if;

  update public.class_enrollments
  set status = 'enrolled'
  where id = p_enrollment_id
  returning * into v_enrollment;

  if v_approved_count + 1 >= v_class.capacity then
    update public.classes set status = 'full' where id = v_class.id;
  end if;

  return v_enrollment;
end;
$$;
