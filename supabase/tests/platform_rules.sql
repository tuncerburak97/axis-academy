-- supabase/tests/platform_rules.sql
-- 0013_platform iş kurallarının uçtan uca testi. Tek işlem içinde çalışır ve sonunda geri alınır.
-- Çalıştırma (yerel): docker exec -i supabase_db_axis-academy psql -U postgres -v ON_ERROR_STOP=1 < supabase/tests/platform_rules.sql
begin;

create or replace function pg_temp.as_user(p_uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_uid::text, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;
create or replace function pg_temp.as_anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('role', 'anon', true);
end $$;
create or replace function pg_temp.as_super() returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
end $$;
create or replace function pg_temp.check(p_ok boolean, p_name text) returns void language plpgsql as $$
begin
  if not coalesce(p_ok, false) then raise exception 'FAIL: %', p_name; end if;
  raise notice 'ok  %', p_name;
end $$;

-- Sabitler
\set admin '''a0000000-0000-4000-8000-000000000001'''
\set elif '''a0000000-0000-4000-8000-000000000002'''
\set ahmet '''a0000000-0000-4000-8000-000000000003'''
\set zeynep '''a0000000-0000-4000-8000-000000000101'''

-- Test dönemi: kapasite 2
insert into public.classes (id, module_id, title, start_date, duration_hours, duration_weeks, capacity)
values ('f0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'Test dönemi', current_date + 5, 10, 4, 2);

-- 1) Anonim katalog okuyabilir, talepleri okuyamaz
select pg_temp.as_anon();
select pg_temp.check((select count(*) from public.pricing_plans) > 0, 'anon fiyat planlarını görür');
select pg_temp.check((select count(*) from public.topics) > 0, 'anon konuları görür');
select pg_temp.check((select count(*) from public.get_catalog_cohorts(null, 50)) > 0, 'anon dönem listesini görür');
select pg_temp.check((select count(*) from public.requests) = 0, 'anon talep göremez');
select pg_temp.check((select count(*) from public.verify_certificate('ax-26-demo01')) = 1, 'sertifika doğrulama (küçük harf)');

-- 2) Başvuru, onay, kontenjan dolunca bekleme listesi
select pg_temp.as_user(:elif);
select pg_temp.check((select status from public.request_class_enrollment('f0000000-0000-4000-8000-000000000001')) = 'pending', 'elif başvurur → pending');
do $$ begin
  perform public.request_class_enrollment('f0000000-0000-4000-8000-000000000001');
  raise exception 'FAIL: çift başvuru engellenmeli';
exception when others then
  if sqlerrm not like '%ALREADY_REQUESTED%' then raise; end if;
  raise notice 'ok  çift başvuru engellenir';
end $$;
select pg_temp.as_user(:ahmet);
select public.request_class_enrollment('f0000000-0000-4000-8000-000000000001');
select pg_temp.as_user(:admin);
select public.approve_class_enrollment(id) from public.class_enrollments where class_id = 'f0000000-0000-4000-8000-000000000001';
select pg_temp.check((select status from public.classes where id = 'f0000000-0000-4000-8000-000000000001') = 'full', 'iki onaydan sonra dönem dolu');
select pg_temp.as_user(:zeynep);
select pg_temp.check((select status from public.request_class_enrollment('f0000000-0000-4000-8000-000000000001')) = 'waitlisted', 'dolu döneme başvuru → bekleme listesi');

-- 3) Onaylı kişi ayrılınca dönem açılır, bekleme listesindekine bildirim gider
select pg_temp.as_user(:ahmet);
select public.cancel_my_enrollment(id) from public.class_enrollments
 where class_id = 'f0000000-0000-4000-8000-000000000001' and user_id = :ahmet;
select pg_temp.as_super();
select pg_temp.check((select status from public.classes where id = 'f0000000-0000-4000-8000-000000000001') = 'open', 'yer açılınca dönem tekrar açık');
select pg_temp.check(exists(select 1 from public.notifications where user_id = :zeynep and kind = 'waitlist'), 'bekleme listesine yer açıldı bildirimi');

-- 4) İptal eden tekrar başvurabilir
select pg_temp.as_user(:ahmet);
select pg_temp.check((select status from public.request_class_enrollment('f0000000-0000-4000-8000-000000000001')) = 'pending', 'iptal sonrası tekrar başvuru');

-- 5) Dönemi tamamla → kayıtlar tamamlanır, sertifika üretilir, bekleyenler iptal
select pg_temp.as_user(:admin);
select pg_temp.check(public.complete_class('f0000000-0000-4000-8000-000000000001') = 1, 'complete_class 1 kişi');
select pg_temp.as_super();
select pg_temp.check((select count(*) from public.certificates where class_id = 'f0000000-0000-4000-8000-000000000001') = 1, 'sertifika üretildi');
select pg_temp.check(not exists(select 1 from public.class_enrollments where class_id = 'f0000000-0000-4000-8000-000000000001' and status in ('pending','waitlisted')), 'bekleyen başvurular kapandı');

-- 6) Talepler: kullanıcı yalnızca kendi talebini görür, teklif alanını kendisi dolduramaz
select pg_temp.as_user(:ahmet);
select pg_temp.check(not exists(select 1 from public.requests where user_id = :elif), 'ahmet elifin talebini göremez');
do $$ begin
  insert into public.requests (user_id, kind, title, quote_amount) values ('a0000000-0000-4000-8000-000000000003', 'analysis', 'x', 1);
  raise exception 'FAIL: üye teklif tutarı yazamamalı';
exception when insufficient_privilege or check_violation then raise notice 'ok  üye teklif tutarı yazamaz';
when others then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok  üye teklif tutarı yazamaz (%)', sqlstate;
end $$;
insert into public.requests (id, user_id, kind, title) values ('f0000000-0000-4000-8000-0000000000a1', :ahmet, 'analysis', 'Test analizi');
select pg_temp.as_super();
select pg_temp.check(exists(select 1 from public.notifications where user_id = :admin and link = '/admin/talepler/f0000000-0000-4000-8000-0000000000a1'), 'yeni talep → admin bildirimi');

-- 7) Teklif → kullanıcı onayı → bildirimler
select pg_temp.as_user(:admin);
update public.requests set status = 'quoted', quote_amount = 5000, quoted_at = now() where id = 'f0000000-0000-4000-8000-0000000000a1';
select pg_temp.as_super();
select pg_temp.check(exists(select 1 from public.notifications where user_id = :ahmet and title = 'Teklifin hazır'), 'teklif → üyeye bildirim');
select pg_temp.as_user(:elif);
do $$ begin
  perform public.respond_to_quote('f0000000-0000-4000-8000-0000000000a1', true);
  raise exception 'FAIL: başkasının teklifi onaylanmamalı';
exception when others then if sqlerrm not like '%QUOTE_NOT_PENDING%' then raise; end if; raise notice 'ok  başkasının teklifini onaylayamaz';
end $$;
select pg_temp.as_user(:ahmet);
select pg_temp.check((select status from public.respond_to_quote('f0000000-0000-4000-8000-0000000000a1', true)) = 'approved', 'üye teklifi onaylar');
do $$ begin
  perform public.cancel_my_request('f0000000-0000-4000-8000-0000000000a1');
  raise exception 'FAIL: onaylanmış talep üye tarafından iptal edilmemeli';
exception when others then if sqlerrm not like '%NOT_CANCELLABLE%' then raise; end if; raise notice 'ok  onaylanmış talep iptal edilemez';
end $$;

-- 8) Mesajlar: üye yazar, admin görür; personel bayrağı taklit edilemez
insert into public.request_messages (request_id, author_id, is_staff, body) values ('f0000000-0000-4000-8000-0000000000a1', :ahmet, false, 'Merhaba');
do $$ begin
  insert into public.request_messages (request_id, author_id, is_staff, body) values ('f0000000-0000-4000-8000-0000000000a1', 'a0000000-0000-4000-8000-000000000003', true, 'Sahte');
  raise exception 'FAIL: üye personel mesajı yazamamalı';
exception when others then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok  üye personel mesajı yazamaz';
end $$;
select pg_temp.as_super();
select pg_temp.check(exists(select 1 from public.notifications where user_id = :admin and kind = 'message'), 'üye mesajı → admin bildirimi');

-- 9) Rol: üye kendini admin yapamaz
select pg_temp.as_user(:ahmet);
do $$ begin
  update public.profiles set role = 'admin' where user_id = 'a0000000-0000-4000-8000-000000000003';
exception when insufficient_privilege then raise notice 'ok  rol yükseltme reddedildi';
end $$;
select pg_temp.as_super();
select pg_temp.check((select role from public.profiles where user_id = :ahmet) = 'user', 'üye kendi rolünü yükseltemez');

-- 10) Oturum görünürlüğü: kayıtlı olmayan üye dönem oturumlarını göremez
select pg_temp.as_user(:ahmet);
select pg_temp.check(not exists(select 1 from public.sessions where class_id = 'd0000000-0000-4000-8000-000000000101'), 'kayıtsız üye oturum göremez');
select pg_temp.as_user(:elif);
select pg_temp.check(exists(select 1 from public.sessions where class_id = 'd0000000-0000-4000-8000-000000000101'), 'kayıtlı üye oturumları görür');

-- 11) İndirim kodu
select pg_temp.as_anon();
select pg_temp.check(public.check_discount_code(' axis10 ') = 10, 'indirim kodu (boşluk/küçük harf)');
select pg_temp.check(public.check_discount_code('YOK') is null, 'geçersiz kod null');

-- 12) Yorumlar: yayınlanmamış yorum herkese görünmez
select pg_temp.check((select count(*) from public.get_public_reviews(null, 50)) = (select count(*) from public.reviews where is_published), 'yalnızca yayındaki yorumlar');

select pg_temp.as_super();
rollback;
