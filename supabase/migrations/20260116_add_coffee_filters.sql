-- Table storing user-specific coffee filters
create table public.user_coffee_filters (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  brand text,
  notes text,
  created_at timestamptz not null default now(),
  constraint user_coffee_filters_pkey primary key (id),
  constraint user_coffee_filters_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

create index user_coffee_filters_user_id_idx on public.user_coffee_filters (user_id, created_at desc);

-- Link recipes to coffee filters
alter table public.recipes
  add column coffee_filter_id uuid null references public.user_coffee_filters (id) on delete set null;

create index recipes_coffee_filter_id_idx on public.recipes (coffee_filter_id);

-- Row Level Security
alter table public.user_coffee_filters enable row level security;

create policy "Users can view their coffee filters" on public.user_coffee_filters
  for select using (auth.uid() = user_id);

create policy "Users can insert their coffee filters" on public.user_coffee_filters
  for insert with check (auth.uid() = user_id);

create policy "Users can update their coffee filters" on public.user_coffee_filters
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their coffee filters" on public.user_coffee_filters
  for delete using (auth.uid() = user_id);
