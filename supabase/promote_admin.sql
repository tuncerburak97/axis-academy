-- supabase/promote_admin.sql
-- Bir kullanıcıyı admin yapar. Önce Supabase Dashboard → Authentication → Users →
-- "Add user" ile hesabı oluştur ("Auto confirm" işaretli), sonra e-postayı değiştirip
-- bu betiği SQL Editor'da çalıştır.

update public.profiles
set role = 'admin'
where user_id = (
  select id from auth.users where email = 'selahattintuncer@gmail.com'
);

-- Kontrol: rolü görüntüle
select p.user_id, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.user_id
where p.role = 'admin';
