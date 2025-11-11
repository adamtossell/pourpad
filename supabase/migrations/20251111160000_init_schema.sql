create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  brewer_type text not null,
  coffee_weight numeric,
  grind_size text,
  water_temp numeric,
  total_brew_time numeric,
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger recipes_set_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

create table if not exists public.recipe_pours (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  start_time integer,
  end_time integer,
  water_g integer,
  order_index integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.upvotes (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (recipe_id, user_id)
);

create table if not exists public.saved_recipes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, recipe_id)
);

create index if not exists recipes_user_id_idx on public.recipes(user_id);
create index if not exists recipes_is_public_idx on public.recipes(is_public);
create index if not exists recipes_created_at_idx on public.recipes(created_at desc);
create index if not exists recipe_pours_recipe_order_idx on public.recipe_pours(recipe_id, order_index);
create index if not exists upvotes_user_id_idx on public.upvotes(user_id);
create index if not exists saved_recipes_recipe_id_idx on public.saved_recipes(recipe_id);

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_pours enable row level security;
alter table public.upvotes enable row level security;
alter table public.saved_recipes enable row level security;

drop policy if exists "Profiles are viewable by users" on public.profiles;
create policy "Profiles view: self or admin" on public.profiles
  for select using (
    auth.uid() = id or public.is_admin()
  );

create policy "Profiles update: self" on public.profiles
  for update using (
    auth.uid() = id or public.is_admin()
  );

create policy "Profiles insert by service" on public.profiles
  for insert with check (auth.uid() = id or public.is_admin());

create policy "Recipes select" on public.recipes
  for select using (
    is_public = true or user_id = auth.uid() or public.is_admin()
  );

create policy "Recipes insert" on public.recipes
  for insert with check (
    user_id = auth.uid() or public.is_admin()
  );

create policy "Recipes update" on public.recipes
  for update using (
    user_id = auth.uid() or public.is_admin()
  );

create policy "Recipes delete" on public.recipes
  for delete using (
    user_id = auth.uid() or public.is_admin()
  );

create policy "Pours select" on public.recipe_pours
  for select using (
    public.is_admin() or exists (
      select 1 from public.recipes r
      where r.id = recipe_pours.recipe_id
        and (r.is_public = true or r.user_id = auth.uid())
    )
  );

create policy "Pours manage" on public.recipe_pours
  for all using (
    public.is_admin() or exists (
      select 1 from public.recipes r
      where r.id = recipe_pours.recipe_id
        and r.user_id = auth.uid()
    )
  ) with check (
    public.is_admin() or exists (
      select 1 from public.recipes r
      where r.id = recipe_pours.recipe_id
        and r.user_id = auth.uid()
    )
  );

create policy "Upvotes select" on public.upvotes
  for select using (
    public.is_admin() or user_id = auth.uid() or exists (
      select 1 from public.recipes r
      where r.id = upvotes.recipe_id and r.is_public = true
    )
  );

create policy "Upvotes manage" on public.upvotes
  for all using (
    public.is_admin() or user_id = auth.uid()
  ) with check (
    public.is_admin() or user_id = auth.uid()
  );

create policy "Saved select" on public.saved_recipes
  for select using (
    public.is_admin() or user_id = auth.uid()
  );

create policy "Saved manage" on public.saved_recipes
  for all using (
    public.is_admin() or user_id = auth.uid()
  ) with check (
    public.is_admin() or user_id = auth.uid()
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
