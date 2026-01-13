-- Table storing user-specific coffees
create table public.user_coffees (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  roaster text,
  origin text,
  roast_level text,
  taste_profile text[],
  notes text,
  image_path text,
  created_at timestamptz not null default now(),
  constraint user_coffees_pkey primary key (id),
  constraint user_coffees_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

create index user_coffees_user_id_idx on public.user_coffees (user_id, created_at desc);

-- Link recipes to coffees
alter table public.recipes
  add column coffee_id uuid null references public.user_coffees (id) on delete set null;

create index recipes_coffee_id_idx on public.recipes (coffee_id);

-- Row Level Security for user_coffees
alter table public.user_coffees enable row level security;

create policy "Users can view their coffees" on public.user_coffees
  for select using (auth.uid() = user_id);

create policy "Users can insert their coffees" on public.user_coffees
  for insert with check (auth.uid() = user_id);

create policy "Users can update their coffees" on public.user_coffees
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their coffees" on public.user_coffees
  for delete using (auth.uid() = user_id);

-- Storage bucket for coffee images
insert into storage.buckets (id, name, public)
values ('coffee-images', 'coffee-images', false)
on conflict (id) do nothing;

-- Storage policies for coffee images (same pattern as avatars)
drop policy if exists "Coffee image objects select" on storage.objects;
create policy "Coffee image objects select" on storage.objects
  for select using (
    bucket_id = 'coffee-images' and public.storage_object_user_prefix(name) = auth.uid()::text
  );

drop policy if exists "Coffee image objects insert" on storage.objects;
create policy "Coffee image objects insert" on storage.objects
  for insert with check (
    bucket_id = 'coffee-images' and public.storage_object_user_prefix(name) = auth.uid()::text
  );

drop policy if exists "Coffee image objects update" on storage.objects;
create policy "Coffee image objects update" on storage.objects
  for update using (
    bucket_id = 'coffee-images' and public.storage_object_user_prefix(name) = auth.uid()::text
  ) with check (
    bucket_id = 'coffee-images' and public.storage_object_user_prefix(name) = auth.uid()::text
  );

drop policy if exists "Coffee image objects delete" on storage.objects;
create policy "Coffee image objects delete" on storage.objects
  for delete using (
    bucket_id = 'coffee-images' and public.storage_object_user_prefix(name) = auth.uid()::text
  );
