-- supabase/fix_missing_profiles.sql
-- Onarım: trigger kurulmadan önce oluşturulmuş auth kullanıcıları için
-- eksik profil satırlarını oluşturur ve admin hesabını atar.

-- 1) Profili olmayan tüm auth kullanıcılarına profil satırı aç
insert into public.profiles (user_id, full_name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  coalesce(u.email, '')
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;

-- 2) Admin hesabını ata — E-POSTAYI KENDİ ADMİN E-POSTANLA DEĞİŞTİR
update public.profiles
set role = 'admin'
where email = 'admin@axisakademi.com';

-- 3) Kontrol: trigger yerinde mi? (satır dönmeli)
select tgname from pg_trigger where tgname = 'on_auth_user_created';

-- 4) Kontrol: profiller ve roller
select user_id, email, full_name, role, created_at from public.profiles order by created_at;
