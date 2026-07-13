-- supabase/migrations/0007_admin_delete_policies.sql
-- Admin hard delete için eksik RLS DELETE politikaları

create policy "inquiries_delete_admin" on public.public_inquiries
  for delete using (public.is_admin());

create policy "contact_requests_delete_admin" on public.contact_requests
  for delete using (public.is_admin());

create policy "individual_requests_delete_admin" on public.individual_requests
  for delete using (public.is_admin());

create policy "profiles_delete_admin" on public.profiles
  for delete using (public.is_admin());

create policy "classes_delete_admin" on public.classes
  for delete using (public.is_admin());

create policy "education_modules_delete_admin" on public.education_modules
  for delete using (public.is_admin());

-- request-files storage: admin dosya silebilsin (talep silinince orphan kalmasın)
create policy "request_files_storage_delete_admin" on storage.objects
  for delete using (bucket_id = 'request-files' and public.is_admin());
