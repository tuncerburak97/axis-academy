-- supabase/migrations/0005_courses_inquiries.sql
-- Dynamic courses with material management, public inquiries, schedule requests.

-- ============================================================
-- public_inquiries — login'siz "bize ulaşın" mesajları
-- ============================================================
create table public.public_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'answered', 'closed')),
  admin_notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.public_inquiries enable row level security;

-- Public form: anon dahil herkes gönderebilir (spam koruması uygulama katmanında)
create policy "inquiries_insert_public" on public.public_inquiries
  for insert with check (true);

create policy "inquiries_select_admin" on public.public_inquiries
  for select using (public.is_admin());

create policy "inquiries_update_admin" on public.public_inquiries
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- classes — eğitim varlığına genişleme
-- ============================================================
alter table public.classes add column duration_weeks int not null default 0;
alter table public.classes add column overview text not null default '';

-- ============================================================
-- class_materials — eğitim içerik/doküman yönetimi
-- Kategoriler: general (genel içerik), weekly (haftalık ders), homework (ödev), note (not)
-- ============================================================
create table public.class_materials (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  category text not null check (category in ('general', 'weekly', 'homework', 'note')),
  week_number int,
  title text not null,
  content_md text not null default '',   -- Markdown içerik (react-markdown ile render edilir)
  file_path text,                        -- 'class-materials' bucket içindeki yol: {class_id}/{dosya}
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.class_materials enable row level security;

-- Yalnız o eğitime onaylı kayıtlı kullanıcı (pending/cancelled hariç) ve admin okur
create policy "materials_select_enrolled" on public.class_materials
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.class_enrollments e
      where e.class_id = class_materials.class_id
        and e.user_id = auth.uid()
        and e.status not in ('pending', 'cancelled')
    )
  );

create policy "materials_manage_admin" on public.class_materials
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- individual_requests — tarih talebi tipi + kullanıcı mesajı
-- ============================================================
alter table public.individual_requests drop constraint individual_requests_request_type_check;
alter table public.individual_requests
  add constraint individual_requests_request_type_check
  check (request_type in ('bundle', 'custom', 'schedule'));

alter table public.individual_requests add column user_message text not null default '';

-- ============================================================
-- Storage: 'class-materials' bucket'ını dashboard'dan PRIVATE oluştur.
-- Yol düzeni: {class_id}/{dosya_adi}
-- ============================================================
create policy "class_materials_storage_insert_admin" on storage.objects
  for insert with check (bucket_id = 'class-materials' and public.is_admin());

create policy "class_materials_storage_delete_admin" on storage.objects
  for delete using (bucket_id = 'class-materials' and public.is_admin());

create policy "class_materials_storage_select_enrolled" on storage.objects
  for select using (
    bucket_id = 'class-materials'
    and (
      public.is_admin()
      or exists (
        select 1 from public.class_enrollments e
        where e.user_id = auth.uid()
          and e.status not in ('pending', 'cancelled')
          and e.class_id::text = (storage.foldername(name))[1]
      )
    )
  );

-- ============================================================
-- Public "yaklaşan eğitimler": kişisel veri içermeyen tarih şeridi
-- ============================================================
create or replace function public.get_public_upcoming_classes(p_module_id uuid)
returns table (
  id uuid,
  title text,
  start_date date,
  duration_hours int,
  duration_weeks int
)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.title, c.start_date, c.duration_hours, c.duration_weeks
  from public.classes c
  where c.module_id = p_module_id
    and c.status = 'open'
    and c.start_date >= current_date
  order by c.start_date
  limit 6;
$$;
