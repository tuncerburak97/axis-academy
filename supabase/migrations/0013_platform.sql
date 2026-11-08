-- supabase/migrations/0013_platform.sql
-- Axis Akademi 2.0 platform modeli.
--  * Katalog herkese açık (fiyat planları, konular, dönemler)
--  * Birleşik talep hattı: analiz, tez, kurumsal ve eğitim talepleri tek tabloda (requests)
--    Eski contact_requests / individual_requests satırları requests'e kopyalanır; eski tablolar silinmez.
--  * Talep mesajları, talep dosyaları, teklif onayı, kullanıcı iptali
--  * Ders oturumları (takvim), uygulama içi bildirimler
--  * Dönem kaydı yaşam döngüsü: bekleme listesi, tekrar başvuru, otomatik açılma, dönem tamamlama
--  * Sertifika, yorum, indirim kodu, blog, eğitmen rolü, kayıt geçmişi
-- Ödeme bilinçli olarak modellenmez (proje kararı).

-- ============================================================
-- 1. PROFİLLER: eğitmen rolü, bildirim tercihi
-- ============================================================
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'instructor', 'admin'));
alter table public.profiles add column if not exists email_notifications boolean not null default true;

-- Kullanıcı kendi rolünü değiştiremez; eğitmen de kendi profilini güncelleyebilmeli
-- Oturumdaki kullanıcının rolü (RLS'e takılmadan okunur)
create or replace function public.my_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where user_id = auth.uid();
$$;

drop policy if exists "profiles_update_own_except_role" on public.profiles;
create policy "profiles_update_own_except_role" on public.profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id and role = public.my_role());

create or replace function public.is_instructor()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where user_id = auth.uid() and role = 'instructor');
$$;

-- ============================================================
-- 2. KATALOG: slug, seviye, açık okuma
-- ============================================================
alter table public.education_modules add column if not exists slug text;
alter table public.education_modules add column if not exists level text not null default 'all'
  check (level in ('beginner', 'intermediate', 'advanced', 'all'));
alter table public.education_modules add column if not exists audience text not null default '';
alter table public.education_modules add column if not exists outcomes text[] not null default '{}';

-- Türkçe karakterleri sadeleştirerek URL dostu slug üretir
create or replace function public.slugify(p_text text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(translate(coalesce(p_text, ''), 'ÇĞİIÖŞÜçğıiöşü', 'cgiiosucgiiosu')),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

update public.education_modules
set slug = public.slugify(title) || case
  when exists (
    select 1 from public.education_modules o
    where o.id <> education_modules.id and public.slugify(o.title) = public.slugify(education_modules.title)
  ) then '-' || left(id::text, 4) else '' end
where slug is null or slug = '';

alter table public.education_modules alter column slug set not null;
alter table public.education_modules alter column slug set default '';  -- boş gelirse tetikleyici başlıktan üretir
create unique index if not exists education_modules_slug_key on public.education_modules (slug);

create or replace function public.set_module_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.slugify(new.title);
    if exists (select 1 from public.education_modules where slug = new.slug and id <> new.id) then
      new.slug := new.slug || '-' || left(new.id::text, 4);
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists education_modules_slug on public.education_modules;
create trigger education_modules_slug
  before insert or update on public.education_modules
  for each row execute function public.set_module_slug();

-- Fiyat planları ve konular artık herkese açık (aktif olanlar)
drop policy if exists "pricing_plans_select_authenticated" on public.pricing_plans;
create policy "pricing_plans_select_public" on public.pricing_plans
  for select using (
    public.is_admin()
    or (is_active = true and exists (
      select 1 from public.education_modules m where m.id = pricing_plans.module_id and m.is_active = true
    ))
  );

drop policy if exists "topics_select_authenticated" on public.topics;
create policy "topics_select_public" on public.topics
  for select using (
    public.is_admin()
    or (is_active = true and exists (
      select 1 from public.education_modules m where m.id = topics.module_id and m.is_active = true
    ))
  );

-- ============================================================
-- 3. DÖNEMLER (classes): fiyat, yer/link, eğitmen, herkese açık okuma
-- ============================================================
alter table public.classes add column if not exists price numeric(10, 2);
alter table public.classes add column if not exists location text not null default 'Online';
alter table public.classes add column if not exists meeting_url text not null default '';
alter table public.classes add column if not exists instructor_id uuid references public.profiles(user_id) on delete set null;
alter table public.classes add column if not exists completed_at timestamptz;

create or replace function public.is_class_instructor(p_class_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.classes where id = p_class_id and instructor_id = auth.uid());
$$;

-- Dönem başlıkları ve tarihleri kişisel veri içermez: anonim okuma serbest.
-- Toplantı linki gibi alanlar uygulama katmanında yalnızca kayıtlılara gösterilir.
drop policy if exists "classes_select_authenticated" on public.classes;
create policy "classes_select_public" on public.classes
  for select using (true);

create policy "classes_update_instructor" on public.classes
  for update using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());

-- ============================================================
-- 4. DÖNEM KAYITLARI: bekleme listesi, tekrar başvuru, iptal
-- ============================================================
alter table public.class_enrollments drop constraint if exists class_enrollments_status_check;
alter table public.class_enrollments
  add constraint class_enrollments_status_check
  check (status in ('pending', 'waitlisted', 'enrolled', 'in_progress', 'completed', 'cancelled'));
alter table public.class_enrollments add column if not exists updated_at timestamptz not null default now();
alter table public.class_enrollments add column if not exists note text not null default '';
alter table public.class_enrollments add column if not exists discount_code text;

-- Reddedilen/iptal eden kişi aynı döneme tekrar başvurabilsin: tekillik yalnızca aktif kayıtlarda
alter table public.class_enrollments drop constraint if exists class_enrollments_class_id_user_id_key;
create unique index if not exists class_enrollments_active_unique
  on public.class_enrollments (class_id, user_id)
  where status <> 'cancelled';

-- Eğitmen kendi dönemindeki kayıtları görür
create policy "enrollments_select_instructor" on public.class_enrollments
  for select using (public.is_class_instructor(class_id));

create or replace function public.class_taken_seats(p_class_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.class_enrollments
  where class_id = p_class_id and status in ('enrolled', 'in_progress', 'completed');
$$;

-- Başvuru: dönem açıksa "pending", doluysa bekleme listesine alınır
drop function if exists public.request_class_enrollment(uuid);
create or replace function public.request_class_enrollment(p_class_id uuid, p_note text default '', p_discount_code text default null)
returns public.class_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.classes%rowtype;
  v_enrollment public.class_enrollments;
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_class from public.classes where id = p_class_id;
  if not found or v_class.status not in ('open', 'full') or v_class.start_date < current_date then
    raise exception 'CLASS_NOT_OPEN';
  end if;

  if exists (
    select 1 from public.class_enrollments
    where class_id = p_class_id and user_id = auth.uid() and status <> 'cancelled'
  ) then
    raise exception 'ALREADY_REQUESTED';
  end if;

  v_status := case
    when v_class.status = 'full' or public.class_taken_seats(p_class_id) >= v_class.capacity then 'waitlisted'
    else 'pending'
  end;

  insert into public.class_enrollments (class_id, user_id, status, note, discount_code)
  values (p_class_id, auth.uid(), v_status, left(coalesce(p_note, ''), 1000), nullif(upper(trim(p_discount_code)), ''))
  returning * into v_enrollment;

  return v_enrollment;
end;
$$;
revoke execute on function public.request_class_enrollment(uuid, text, text) from anon;

-- Onay: bekleme listesindeki kayıt da onaylanabilir (yer açılmışsa)
create or replace function public.approve_class_enrollment(p_enrollment_id uuid)
returns public.class_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment public.class_enrollments%rowtype;
  v_class public.classes%rowtype;
  v_taken int;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  select * into v_enrollment from public.class_enrollments where id = p_enrollment_id for update;
  if not found or v_enrollment.status not in ('pending', 'waitlisted') then
    raise exception 'ENROLLMENT_NOT_PENDING';
  end if;

  select * into v_class from public.classes where id = v_enrollment.class_id for update;
  v_taken := public.class_taken_seats(v_class.id);
  if v_taken >= v_class.capacity then
    update public.classes set status = 'full' where id = v_class.id and status = 'open';
    raise exception 'CLASS_FULL';
  end if;

  update public.class_enrollments
  set status = 'enrolled', updated_at = now()
  where id = p_enrollment_id
  returning * into v_enrollment;

  if v_taken + 1 >= v_class.capacity then
    update public.classes set status = 'full' where id = v_class.id and status = 'open';
  end if;

  return v_enrollment;
end;
$$;

-- Kullanıcı kendi başvurusunu/kaydını iptal eder (dönem bitmemişse)
create or replace function public.cancel_my_enrollment(p_enrollment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.class_enrollments
  set status = 'cancelled', updated_at = now()
  where id = p_enrollment_id
    and user_id = auth.uid()
    and status in ('pending', 'waitlisted', 'enrolled');
  if not found then
    raise exception 'NOT_CANCELLABLE';
  end if;
end;
$$;
revoke execute on function public.cancel_my_enrollment(uuid) from anon;

-- Admin: bir kişiyi doğrudan döneme ekler (onaylı)
create or replace function public.admin_add_enrollment(p_class_id uuid, p_user_id uuid)
returns public.class_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment public.class_enrollments;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if exists (
    select 1 from public.class_enrollments
    where class_id = p_class_id and user_id = p_user_id and status <> 'cancelled'
  ) then
    update public.class_enrollments set status = 'enrolled', updated_at = now()
    where class_id = p_class_id and user_id = p_user_id and status in ('pending', 'waitlisted')
    returning * into v_enrollment;
    if v_enrollment.id is null then
      raise exception 'ALREADY_ENROLLED';
    end if;
    return v_enrollment;
  end if;
  insert into public.class_enrollments (class_id, user_id, status)
  values (p_class_id, p_user_id, 'enrolled')
  returning * into v_enrollment;
  return v_enrollment;
end;
$$;

-- Yer açılınca dolu dönem otomatik açılır; dolunca kapanır
create or replace function public.sync_class_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid := coalesce(new.class_id, old.class_id);
  v_capacity int;
  v_status text;
  v_taken int;
begin
  select capacity, status into v_capacity, v_status from public.classes where id = v_class_id;
  if not found then
    return null;
  end if;
  v_taken := public.class_taken_seats(v_class_id);
  if v_status = 'full' and v_taken < v_capacity then
    update public.classes set status = 'open' where id = v_class_id;
  elsif v_status = 'open' and v_taken >= v_capacity then
    update public.classes set status = 'full' where id = v_class_id;
  end if;
  return null;
end;
$$;
drop trigger if exists class_enrollments_capacity on public.class_enrollments;
create trigger class_enrollments_capacity
  after insert or update of status or delete on public.class_enrollments
  for each row execute function public.sync_class_capacity();

-- Kapasite değişince de senkronize et
create or replace function public.sync_class_capacity_on_class()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_taken int;
begin
  if new.status not in ('open', 'full') then
    return new;
  end if;
  v_taken := public.class_taken_seats(new.id);
  if v_taken >= new.capacity then
    new.status := 'full';
  else
    new.status := 'open';
  end if;
  return new;
end;
$$;
drop trigger if exists classes_capacity on public.classes;
create trigger classes_capacity
  before update of capacity on public.classes
  for each row execute function public.sync_class_capacity_on_class();

-- ============================================================
-- 5. BİRLEŞİK TALEPLER
-- ============================================================
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  kind text not null check (kind in ('analysis', 'thesis', 'corporate', 'training')),
  training_mode text check (training_mode in ('bundle', 'custom', 'schedule')),
  module_id uuid references public.education_modules(id) on delete set null,
  bundle_id uuid references public.bundle_packages(id) on delete set null,
  topic_ids uuid[] not null default '{}',
  total_hours int,
  title text not null default '',
  details jsonb not null default '{}'::jsonb,       -- sihirbazdan gelen alanlar (alan, sayfa sayısı, teslim tarihi…)
  message text not null default '',
  status text not null default 'received'
    check (status in ('received', 'quoted', 'approved', 'planned', 'in_progress', 'completed', 'cancelled')),
  price_estimate numeric(10, 2),                    -- sistemin hesapladığı tahmin (paket/özel modül)
  discount_code text,
  discount_percent int check (discount_percent is null or (discount_percent between 1 and 100)),
  quote_amount numeric(10, 2),                      -- admin teklifi (bilgi amaçlı; ödeme platform dışında)
  quote_note text not null default '',
  quote_valid_until date,
  quoted_at timestamptz,
  decided_at timestamptz,
  due_date date,
  progress_note text not null default '',           -- kullanıcıya görünen kısa durum notu
  admin_notes text not null default '',             -- yalnızca admin
  assignee_id uuid references public.profiles(user_id) on delete set null,
  legacy_table text,
  legacy_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);
create index if not exists requests_user_idx on public.requests (user_id, created_at desc);
create index if not exists requests_status_idx on public.requests (status, last_activity_at desc);
create unique index if not exists requests_legacy_idx on public.requests (legacy_table, legacy_id) where legacy_id is not null;

alter table public.requests enable row level security;
create policy "requests_select_own" on public.requests
  for select using (auth.uid() = user_id or public.is_admin());
create policy "requests_insert_own" on public.requests
  for insert with check (
    auth.uid() = user_id
    and status = 'received'
    and quote_amount is null
    and admin_notes = ''
    and assignee_id is null
  );
create policy "requests_update_admin" on public.requests
  for update using (public.is_admin()) with check (public.is_admin());
create policy "requests_delete_admin" on public.requests
  for delete using (public.is_admin());

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists requests_touch on public.requests;
create trigger requests_touch before update on public.requests
  for each row execute function public.touch_updated_at();

-- Eski kayıtları taşı (tekrar çalıştırılırsa çift kayıt oluşmaz)
insert into public.requests (
  user_id, kind, title, message, status, admin_notes, created_at, updated_at, last_activity_at, legacy_table, legacy_id
)
select
  c.user_id,
  c.service_type,
  case c.service_type when 'analysis' then 'Analiz talebi' else 'Tez düzenleme talebi' end,
  c.message,
  case c.status
    when 'new' then 'received'
    when 'contacted' then 'planned'
    when 'in_progress' then 'in_progress'
    when 'completed' then 'completed'
    else 'received'
  end,
  c.admin_notes,
  c.created_at, c.created_at, c.created_at,
  'contact_requests', c.id
from public.contact_requests c
on conflict do nothing;

insert into public.requests (
  user_id, kind, training_mode, module_id, bundle_id, topic_ids, total_hours, title, message, status,
  price_estimate, progress_note, admin_notes, created_at, updated_at, last_activity_at, legacy_table, legacy_id
)
select
  i.user_id,
  'training',
  i.request_type,
  i.module_id,
  i.bundle_id,
  i.topic_ids,
  i.total_hours,
  coalesce(b.title, m.title, 'Eğitim talebi'),
  i.user_message,
  i.status,
  nullif(i.calculated_price, 0),
  i.progress_note,
  i.admin_notes,
  i.created_at, i.created_at, i.created_at,
  'individual_requests', i.id
from public.individual_requests i
left join public.education_modules m on m.id = i.module_id
left join public.bundle_packages b on b.id = i.bundle_id
on conflict do nothing;

-- Teklife yanıt: kullanıcı onaylar ya da reddeder
create or replace function public.respond_to_quote(p_request_id uuid, p_accept boolean)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.requests;
begin
  update public.requests
  set status = case when p_accept then 'approved' else 'cancelled' end,
      decided_at = now(),
      last_activity_at = now()
  where id = p_request_id
    and user_id = auth.uid()
    and status = 'quoted'
  returning * into v_request;
  if v_request.id is null then
    raise exception 'QUOTE_NOT_PENDING';
  end if;
  return v_request;
end;
$$;
revoke execute on function public.respond_to_quote(uuid, boolean) from anon;

-- Kullanıcı talebini işleme alınmadan iptal edebilir
create or replace function public.cancel_my_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.requests
  set status = 'cancelled', decided_at = now(), last_activity_at = now()
  where id = p_request_id and user_id = auth.uid() and status in ('received', 'quoted');
  if not found then
    raise exception 'NOT_CANCELLABLE';
  end if;
end;
$$;
revoke execute on function public.cancel_my_request(uuid) from anon;

-- ============================================================
-- 6. TALEP MESAJLARI VE DOSYALARI
-- ============================================================
create table if not exists public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  author_id uuid references public.profiles(user_id) on delete set null,
  is_staff boolean not null default false,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index if not exists request_messages_request_idx on public.request_messages (request_id, created_at);
alter table public.request_messages enable row level security;

create policy "request_messages_select" on public.request_messages
  for select using (
    public.is_admin()
    or exists (select 1 from public.requests r where r.id = request_messages.request_id and r.user_id = auth.uid())
  );
create policy "request_messages_insert_owner" on public.request_messages
  for insert with check (
    author_id = auth.uid()
    and is_staff = false
    and exists (
      select 1 from public.requests r
      where r.id = request_messages.request_id and r.user_id = auth.uid() and r.status <> 'cancelled'
    )
  );
create policy "request_messages_insert_admin" on public.request_messages
  for insert with check (public.is_admin() and author_id = auth.uid() and is_staff = true);
create policy "request_messages_delete_admin" on public.request_messages
  for delete using (public.is_admin());

create table if not exists public.request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  uploaded_by uuid references public.profiles(user_id) on delete set null,
  file_path text not null,                       -- request-files bucket: {talep sahibinin uid}/{request_id}/{dosya}
  file_name text not null,
  file_size bigint not null default 0,
  is_deliverable boolean not null default false, -- admin'in teslim ettiği çıktı
  created_at timestamptz not null default now()
);
create index if not exists request_files_request_idx on public.request_files (request_id, created_at);
alter table public.request_files enable row level security;

create policy "request_files_select" on public.request_files
  for select using (
    public.is_admin()
    or exists (select 1 from public.requests r where r.id = request_files.request_id and r.user_id = auth.uid())
  );
create policy "request_files_insert_owner" on public.request_files
  for insert with check (
    uploaded_by = auth.uid()
    and is_deliverable = false
    and exists (select 1 from public.requests r where r.id = request_files.request_id and r.user_id = auth.uid())
  );
create policy "request_files_manage_admin" on public.request_files
  for all using (public.is_admin()) with check (public.is_admin());

-- Eski tek dosyaları talep dosyalarına taşı
insert into public.request_files (request_id, uploaded_by, file_path, file_name, created_at)
select r.id, c.user_id, c.file_path, regexp_replace(c.file_path, '^.*/', ''), c.created_at
from public.contact_requests c
join public.requests r on r.legacy_table = 'contact_requests' and r.legacy_id = c.id
where c.file_path is not null
  and not exists (select 1 from public.request_files f where f.request_id = r.id and f.file_path = c.file_path);

-- Admin teslim dosyalarını kullanıcının klasörüne yükleyebilir
create policy "request_files_storage_insert_admin" on storage.objects
  for insert with check (bucket_id = 'request-files' and public.is_admin());

-- Mesaj/dosya eklenince talebin son hareket zamanı güncellenir
create or replace function public.bump_request_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.requests set last_activity_at = now() where id = new.request_id;
  return new;
end;
$$;
drop trigger if exists request_messages_activity on public.request_messages;
create trigger request_messages_activity after insert on public.request_messages
  for each row execute function public.bump_request_activity();
drop trigger if exists request_files_activity on public.request_files;
create trigger request_files_activity after insert on public.request_files
  for each row execute function public.bump_request_activity();

-- ============================================================
-- 7. DERS OTURUMLARI (takvim)
-- ============================================================
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  request_id uuid references public.requests(id) on delete cascade,
  title text not null default '',
  week_number int,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null default 'Online',
  meeting_url text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  check ((class_id is null) <> (request_id is null)),
  check (ends_at > starts_at)
);
create index if not exists sessions_starts_idx on public.sessions (starts_at);
create index if not exists sessions_class_idx on public.sessions (class_id, starts_at);
create index if not exists sessions_request_idx on public.sessions (request_id, starts_at);
alter table public.sessions enable row level security;

create policy "sessions_select" on public.sessions
  for select using (
    public.is_admin()
    or (class_id is not null and public.is_class_instructor(class_id))
    or (class_id is not null and exists (
      select 1 from public.class_enrollments e
      where e.class_id = sessions.class_id and e.user_id = auth.uid()
        and e.status in ('enrolled', 'in_progress', 'completed')
    ))
    or (request_id is not null and exists (
      select 1 from public.requests r where r.id = sessions.request_id and r.user_id = auth.uid()
    ))
  );
create policy "sessions_manage_admin" on public.sessions
  for all using (public.is_admin()) with check (public.is_admin());
create policy "sessions_manage_instructor" on public.sessions
  for all using (class_id is not null and public.is_class_instructor(class_id))
  with check (class_id is not null and public.is_class_instructor(class_id));

-- Eğitmen kendi dönemine materyal ve duyuru ekleyebilir
create policy "materials_manage_instructor" on public.class_materials
  for all using (public.is_class_instructor(class_id)) with check (public.is_class_instructor(class_id));
create policy "announcements_manage_instructor" on public.class_announcements
  for all using (public.is_class_instructor(class_id)) with check (public.is_class_instructor(class_id));
create policy "class_materials_storage_insert_instructor" on storage.objects
  for insert with check (
    bucket_id = 'class-materials'
    and public.is_class_instructor(((storage.foldername(name))[1])::uuid)
  );
create policy "class_materials_storage_select_instructor" on storage.objects
  for select using (
    bucket_id = 'class-materials'
    and public.is_class_instructor(((storage.foldername(name))[1])::uuid)
  );

-- ============================================================
-- 8. BİLDİRİMLER
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  kind text not null default 'info',
  title text not null,
  body text not null default '',
  link text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_delete_own" on public.notifications
  for delete using (auth.uid() = user_id);

create or replace function public.push_notification(p_user_id uuid, p_kind text, p_title text, p_body text, p_link text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, kind, title, body, link)
  values (p_user_id, p_kind, p_title, coalesce(p_body, ''), coalesce(p_link, ''));
$$;
revoke execute on function public.push_notification(uuid, text, text, text, text) from anon, authenticated;

create or replace function public.notify_admins(p_kind text, p_title text, p_body text, p_link text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, kind, title, body, link)
  select user_id, p_kind, p_title, coalesce(p_body, ''), coalesce(p_link, '')
  from public.profiles where role = 'admin';
$$;
revoke execute on function public.notify_admins(text, text, text, text) from anon, authenticated;

create or replace function public.mark_notifications_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications set read_at = now() where user_id = auth.uid() and read_at is null;
$$;
revoke execute on function public.mark_notifications_read() from anon;

-- Talep olayları → bildirim
create or replace function public.request_status_label(p_status text)
returns text
language sql
immutable
as $$
  select case p_status
    when 'received' then 'Alındı'
    when 'quoted' then 'Teklif hazır'
    when 'approved' then 'Onaylandı'
    when 'planned' then 'Planlandı'
    when 'in_progress' then 'Devam ediyor'
    when 'completed' then 'Tamamlandı'
    when 'cancelled' then 'İptal edildi'
    else p_status
  end;
$$;

create or replace function public.notify_request_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify_admins('request_new', 'Yeni talep: ' || coalesce(nullif(new.title, ''), new.kind), '', '/admin/talepler/' || new.id);
  elsif new.status is distinct from old.status then
    if public.is_admin() then
      perform public.push_notification(
        new.user_id,
        'request_status',
        case when new.status = 'quoted' then 'Teklifin hazır' else 'Talebin güncellendi: ' || public.request_status_label(new.status) end,
        coalesce(nullif(new.title, ''), ''),
        '/panel/talepler/' || new.id
      );
    else
      perform public.notify_admins(
        'request_status',
        case new.status
          when 'approved' then 'Teklif onaylandı'
          when 'cancelled' then 'Talep iptal edildi'
          else 'Talep güncellendi'
        end || ': ' || coalesce(nullif(new.title, ''), new.kind),
        '',
        '/admin/talepler/' || new.id
      );
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists requests_notify on public.requests;
create trigger requests_notify after insert or update of status on public.requests
  for each row execute function public.notify_request_events();

create or replace function public.notify_request_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.requests;
begin
  select * into v_request from public.requests where id = new.request_id;
  if new.is_staff then
    perform public.push_notification(v_request.user_id, 'message', 'Axis ekibinden yeni mesaj', left(new.body, 140), '/panel/talepler/' || v_request.id);
  else
    perform public.notify_admins('message', 'Yeni mesaj: ' || coalesce(nullif(v_request.title, ''), v_request.kind), left(new.body, 140), '/admin/talepler/' || v_request.id);
  end if;
  return new;
end;
$$;
drop trigger if exists request_messages_notify on public.request_messages;
create trigger request_messages_notify after insert on public.request_messages
  for each row execute function public.notify_request_message();

create or replace function public.notify_request_file()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.requests;
begin
  if new.is_deliverable then
    select * into v_request from public.requests where id = new.request_id;
    perform public.push_notification(v_request.user_id, 'file', 'Teslim dosyan hazır', new.file_name, '/panel/talepler/' || v_request.id);
  end if;
  return new;
end;
$$;
drop trigger if exists request_files_notify on public.request_files;
create trigger request_files_notify after insert on public.request_files
  for each row execute function public.notify_request_file();

-- Kayıt olayları → bildirim
create or replace function public.notify_enrollment_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_first_waitlisted uuid;
begin
  select title into v_title from public.classes where id = coalesce(new.class_id, old.class_id);

  if tg_op = 'INSERT' then
    perform public.notify_admins(
      'enrollment_new',
      case when new.status = 'waitlisted' then 'Bekleme listesine katılım: ' else 'Yeni dönem başvurusu: ' end || v_title,
      '',
      '/admin/donemler/' || new.class_id
    );
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status = 'enrolled' and old.status in ('pending', 'waitlisted') then
      perform public.push_notification(new.user_id, 'enrollment', 'Kaydın onaylandı', v_title, '/panel/egitimler/' || new.class_id);
    elsif new.status = 'cancelled' and public.is_admin() then
      perform public.push_notification(new.user_id, 'enrollment', 'Başvurun sonuçlandırıldı', v_title || ' için kaydın iptal edildi.', '/panel/egitimler');
    elsif new.status = 'completed' then
      perform public.push_notification(new.user_id, 'enrollment', 'Tebrikler, eğitimini tamamladın', v_title, '/panel/belgeler');
    end if;

    -- Onaylı biri ayrılınca bekleme listesindeki ilk kişiye haber ver
    if new.status = 'cancelled' and old.status in ('enrolled', 'in_progress') then
      select user_id into v_first_waitlisted from public.class_enrollments
      where class_id = new.class_id and status = 'waitlisted'
      order by created_at limit 1;
      if v_first_waitlisted is not null then
        perform public.push_notification(v_first_waitlisted, 'waitlist', 'Dönemde yer açıldı', v_title || ' için başvurun öne alındı; kısa süre içinde onaylanacak.', '/panel/egitimler');
        perform public.notify_admins('waitlist', 'Yer açıldı: ' || v_title, 'Bekleme listesinde onay bekleyen kişi var.', '/admin/donemler/' || new.class_id);
      end if;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists class_enrollments_notify on public.class_enrollments;
create trigger class_enrollments_notify after insert or update of status on public.class_enrollments
  for each row execute function public.notify_enrollment_events();

-- Duyuru ve materyal → kayıtlı öğrencilere bildirim
create or replace function public.notify_class_content()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_heading text;
begin
  select title into v_title from public.classes where id = new.class_id;
  v_heading := case tg_table_name when 'class_announcements' then 'Yeni duyuru' else 'Yeni materyal' end;
  insert into public.notifications (user_id, kind, title, body, link)
  select e.user_id, tg_table_name, v_heading || ': ' || new.title, v_title, '/panel/egitimler/' || new.class_id
  from public.class_enrollments e
  where e.class_id = new.class_id and e.status in ('enrolled', 'in_progress');
  return new;
end;
$$;
drop trigger if exists class_announcements_notify on public.class_announcements;
create trigger class_announcements_notify after insert on public.class_announcements
  for each row execute function public.notify_class_content();
drop trigger if exists class_materials_notify on public.class_materials;
create trigger class_materials_notify after insert on public.class_materials
  for each row execute function public.notify_class_content();

-- ============================================================
-- 9. SERTİFİKALAR
-- ============================================================
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  request_id uuid references public.requests(id) on delete set null,
  recipient_name text not null,
  program_title text not null,
  hours int not null default 0,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz
);
create unique index if not exists certificates_class_user_idx on public.certificates (class_id, user_id) where class_id is not null;
alter table public.certificates enable row level security;
create policy "certificates_select_own" on public.certificates
  for select using (auth.uid() = user_id or public.is_admin());
create policy "certificates_manage_admin" on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.new_certificate_code()
returns text
language sql
volatile
as $$
  select 'AX-' || to_char(now(), 'YY') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
$$;

-- Herkese açık doğrulama: yalnızca belge bilgisi döner
create or replace function public.verify_certificate(p_code text)
returns table (code text, recipient_name text, program_title text, hours int, issued_at timestamptz, revoked boolean)
language sql
security definer
set search_path = public
stable
as $$
  select c.code, c.recipient_name, c.program_title, c.hours, c.issued_at, c.revoked_at is not null
  from public.certificates c
  where c.code = upper(trim(p_code));
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- Dönemi tamamla: aktif kayıtlar tamamlanır, sertifikalar üretilir
create or replace function public.complete_class(p_class_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.classes%rowtype;
  v_program text;
  v_count int := 0;
  v_row record;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;
  select * into v_class from public.classes where id = p_class_id for update;
  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;
  select title into v_program from public.education_modules where id = v_class.module_id;

  for v_row in
    select e.id, e.user_id, coalesce(nullif(p.full_name, ''), p.email) as name
    from public.class_enrollments e
    join public.profiles p on p.user_id = e.user_id
    where e.class_id = p_class_id and e.status in ('enrolled', 'in_progress')
  loop
    update public.class_enrollments set status = 'completed', updated_at = now() where id = v_row.id;
    insert into public.certificates (code, user_id, class_id, recipient_name, program_title, hours)
    values (public.new_certificate_code(), v_row.user_id, p_class_id, v_row.name, coalesce(v_program, v_class.title), v_class.duration_hours)
    on conflict do nothing;
    v_count := v_count + 1;
  end loop;

  update public.class_enrollments set status = 'cancelled', updated_at = now()
  where class_id = p_class_id and status in ('pending', 'waitlisted');

  update public.classes set status = 'completed', completed_at = now() where id = p_class_id;
  return v_count;
end;
$$;

-- ============================================================
-- 10. YORUMLAR
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  module_id uuid references public.education_modules(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  request_id uuid references public.requests(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 2000),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists reviews_user_class_idx on public.reviews (user_id, class_id) where class_id is not null;
create unique index if not exists reviews_user_request_idx on public.reviews (user_id, request_id) where request_id is not null;
alter table public.reviews enable row level security;
create policy "reviews_select" on public.reviews
  for select using (is_published = true or auth.uid() = user_id or public.is_admin());
create policy "reviews_insert_own" on public.reviews
  for insert with check (
    auth.uid() = user_id
    and is_published = false
    and (
      (class_id is not null and exists (
        select 1 from public.class_enrollments e
        where e.class_id = reviews.class_id and e.user_id = auth.uid() and e.status in ('in_progress', 'completed', 'enrolled')
      ))
      or (request_id is not null and exists (
        select 1 from public.requests r
        where r.id = reviews.request_id and r.user_id = auth.uid() and r.status in ('in_progress', 'completed')
      ))
    )
  );
create policy "reviews_manage_admin" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- Yayındaki yorumlar: yalnızca ad ve soyadın baş harfi görünür
create or replace function public.get_public_reviews(p_module_id uuid default null, p_limit int default 12)
returns table (id uuid, rating int, comment text, author text, program_title text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.id, r.rating, r.comment,
    coalesce(nullif(split_part(trim(p.full_name), ' ', 1), ''), 'Katılımcı')
      || case when position(' ' in trim(p.full_name)) > 0
           then ' ' || left(regexp_replace(trim(p.full_name), '^.* ', ''), 1) || '.'
           else '' end,
    m.title,
    r.created_at
  from public.reviews r
  join public.profiles p on p.user_id = r.user_id
  left join public.education_modules m on m.id = r.module_id
  where r.is_published = true and (p_module_id is null or r.module_id = p_module_id)
  order by r.created_at desc
  limit greatest(1, least(p_limit, 50));
$$;
grant execute on function public.get_public_reviews(uuid, int) to anon, authenticated;

-- ============================================================
-- 11. İNDİRİM KODLARI
-- ============================================================
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and char_length(code) between 3 and 32),
  description text not null default '',
  percent int not null check (percent between 1 and 100),
  valid_until date,
  max_uses int check (max_uses is null or max_uses > 0),
  used_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.discount_codes enable row level security;
create policy "discount_codes_manage_admin" on public.discount_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- Kod kontrolü: geçerliyse yüzde döner, değilse null
create or replace function public.check_discount_code(p_code text)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select percent from public.discount_codes
  where code = upper(trim(p_code))
    and is_active = true
    and (valid_until is null or valid_until >= current_date)
    and (max_uses is null or used_count < max_uses);
$$;
grant execute on function public.check_discount_code(text) to anon, authenticated;

-- Kullanılan kod sayacı (talep ve kayıt oluşturulduğunda)
create or replace function public.count_discount_use()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.discount_code is not null then
    update public.discount_codes set used_count = used_count + 1 where code = new.discount_code;
  end if;
  return new;
end;
$$;
drop trigger if exists requests_discount on public.requests;
create trigger requests_discount after insert on public.requests
  for each row execute function public.count_discount_use();
drop trigger if exists enrollments_discount on public.class_enrollments;
create trigger enrollments_discount after insert on public.class_enrollments
  for each row execute function public.count_discount_use();

-- ============================================================
-- 12. BLOG
-- ============================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 200),
  excerpt text not null default '' check (char_length(excerpt) <= 400),
  body_md text not null default '',
  tags text[] not null default '{}',
  author_name text not null default 'Axis Akademi',
  reading_minutes int not null default 3,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create policy "posts_select_published" on public.posts
  for select using (is_published = true or public.is_admin());
create policy "posts_manage_admin" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 13. KAYIT GEÇMİŞİ (admin işlemleri)
-- ============================================================
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(user_id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  summary text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
alter table public.audit_log enable row level security;
create policy "audit_log_select_admin" on public.audit_log
  for select using (public.is_admin());
create policy "audit_log_insert_admin" on public.audit_log
  for insert with check (public.is_admin() and actor_id = auth.uid());

-- ============================================================
-- 14. HERKESE AÇIK DÖNEM LİSTESİ (kontenjan sayısıyla)
-- ============================================================
create or replace function public.get_catalog_cohorts(p_module_id uuid default null, p_limit int default 24)
returns table (
  id uuid,
  title text,
  description text,
  overview text,
  start_date date,
  schedule_note text,
  duration_hours int,
  duration_weeks int,
  capacity int,
  taken_seats int,
  price numeric,
  location text,
  status text,
  my_status text,
  module_id uuid,
  module_title text,
  module_slug text,
  module_category text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id, c.title, c.description, c.overview, c.start_date, c.schedule_note,
    c.duration_hours, c.duration_weeks, c.capacity,
    public.class_taken_seats(c.id),
    c.price, c.location, c.status,
    (
      select e.status from public.class_enrollments e
      where e.class_id = c.id and e.user_id = auth.uid() and e.status <> 'cancelled'
      order by e.created_at desc limit 1
    ),
    m.id, m.title, m.slug, m.category
  from public.classes c
  join public.education_modules m on m.id = c.module_id
  where c.status in ('open', 'full')
    and c.start_date >= current_date
    and m.is_active = true
    and (p_module_id is null or c.module_id = p_module_id)
  order by c.start_date
  limit greatest(1, least(p_limit, 100));
$$;
grant execute on function public.get_catalog_cohorts(uuid, int) to anon, authenticated;

-- ============================================================
-- 15. SİTE İÇERİĞİ: SSS metni yeni kurguya göre güncellenir (admin değiştirmediyse)
-- ============================================================
update public.site_content
set content_json = jsonb_build_object('items', jsonb_build_array(
  jsonb_build_object('question', 'Ödeme site üzerinden mi yapılıyor?', 'answer', 'Hayır. Fiyatlar sitede açıkça yazar; ödeme ekibimizle doğrudan konuşulur.'),
  jsonb_build_object('question', 'Bir döneme nasıl kayıt olurum?', 'answer', 'Program sayfasından dönemi seçip "Yerimi ayır" demen yeterli. Başvurun onaylanınca e-posta ve panel bildirimi alırsın.'),
  jsonb_build_object('question', 'Dönem doluysa ne olur?', 'answer', 'Bekleme listesine katılırsın. Yer açılır açılmaz sana haber veririz.'),
  jsonb_build_object('question', 'Analiz ve tez talepleri nasıl işliyor?', 'answer', 'Kısa bir formla ihtiyacını anlatırsın, dosyanı eklersin. Ekibimiz inceleyip panelinde teklif sunar; onaylarsan süreç başlar ve her adımı panelinden izlersin.'),
  jsonb_build_object('question', 'Eğitim sonunda belge alıyor muyum?', 'answer', 'Evet. Dönemi tamamlayan herkes doğrulama kodlu bir katılım belgesi alır; belge panelindeki Belgelerim bölümünde durur.')
)), updated_at = now()
where page_key = 'faq' and section_key = 'items'
  and content_json::text like '%Eğitim detaylarını neden göremiyorum%';
