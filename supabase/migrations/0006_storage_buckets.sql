-- supabase/migrations/0006_storage_buckets.sql
-- Storage bucket'larını otomatik oluşturur (manuel dashboard adımını kaldırır)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'class-materials',
  'class-materials',
  false,
  20971520,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'text/markdown',
    'text/plain',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit)
values ('request-files', 'request-files', false, 20971520)
on conflict (id) do nothing;
