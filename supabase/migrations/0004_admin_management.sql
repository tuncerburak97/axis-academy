-- supabase/migrations/0004_admin_management.sql
-- Admin management support: email on profiles (auth.users is not queryable
-- via PostgREST) and seed content for the admin-managed public copy.

-- ============================================================
-- profiles.email — filled by trigger on signup, backfilled here
-- ============================================================
alter table public.profiles add column email text not null default '';

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.user_id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.email, ''));
  return new;
end;
$$;

-- ============================================================
-- site_content seed — defaults match the current hardcoded copy;
-- admin edits override these rows
-- ============================================================
insert into public.site_content (page_key, section_key, content_json) values
  ('home', 'hero', jsonb_build_object(
    'title', 'Akademik işlerinizde net, profesyonel ve güvenilir destek',
    'subtitle', 'İhtiyacınız analiz, ofis programları eğitimi ya da tez düzenleme olsun — süreci sadeleştirir, sonucu garantiye alırız. Fiyatlar şeffaf, iletişim doğrudan.'
  )),
  ('analysis', 'intro', jsonb_build_object(
    'title', 'Bibliyometrik & İstatistiksel Analiz',
    'description', 'Araştırma verinizi uzman ellere bırakın; yöntem seçimi, analiz ve raporlama uçtan uca bizde.',
    'body', 'Analiz talepleri projeye özel değerlendirilir ve fiyatlandırılır. Talep oluşturmak için ücretsiz üye olun; ekibimiz sizinle doğrudan iletişime geçsin.'
  )),
  ('thesis', 'intro', jsonb_build_object(
    'title', 'Tez Düzenleme',
    'description', 'Teziniz; biçim, kaynakça ve enstitü şablon kurallarına uygun, teslime hazır hâle getirilir.',
    'body', 'Tez düzenleme talepleri projeye özel değerlendirilir. Üye olup talebinizi dosyanızla birlikte iletin; size net bir teklifle dönelim.'
  )),
  ('education', 'intro', jsonb_build_object(
    'title', 'Ofis Programları Eğitimleri',
    'description', 'Hazır paketler, sana özel modüller ya da sınıf eğitimleri — öğrenme şeklini sen seç.'
  )),
  ('faq', 'items', jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object('question', 'Ödeme site üzerinden mi yapılıyor?', 'answer', 'Hayır. Fiyatlar sitede net olarak gösterilir; ödeme süreci ekibimizle doğrudan konuşulur.'),
      jsonb_build_object('question', 'Eğitim detaylarını neden göremiyorum?', 'answer', 'Açık sınıflar ve detaylı fiyat tabloları üyelere açıktır. Ücretsiz kayıt olduktan sonra tüm detayları panelinizden görebilirsiniz.'),
      jsonb_build_object('question', 'Analiz ve tez talepleri nasıl işliyor?', 'answer', 'Talebinizi panelinizden iletirsiniz; ekibimiz inceleyip size özel teklif ve planlama ile döner.')
    )
  ))
on conflict (page_key, section_key) do nothing;
