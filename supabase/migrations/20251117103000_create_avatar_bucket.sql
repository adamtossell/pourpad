insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

create or replace function public.storage_object_user_prefix(name text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select split_part(name, '/', 1);
$$;

drop policy if exists "Avatar objects select" on storage.objects;
create policy "Avatar objects select" on storage.objects
  for select using (
    bucket_id = 'avatars' and public.storage_object_user_prefix(name) = auth.uid()::text
  );

drop policy if exists "Avatar objects insert" on storage.objects;
create policy "Avatar objects insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and public.storage_object_user_prefix(name) = auth.uid()::text
  );

drop policy if exists "Avatar objects update" on storage.objects;
create policy "Avatar objects update" on storage.objects
  for update using (
    bucket_id = 'avatars' and public.storage_object_user_prefix(name) = auth.uid()::text
  ) with check (
    bucket_id = 'avatars' and public.storage_object_user_prefix(name) = auth.uid()::text
  );

drop policy if exists "Avatar objects delete" on storage.objects;
create policy "Avatar objects delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and public.storage_object_user_prefix(name) = auth.uid()::text
  );
