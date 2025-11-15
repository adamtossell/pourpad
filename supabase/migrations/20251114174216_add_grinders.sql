-- Create enum for grinder scale types
create type grinder_scale_type as enum ('text', 'numeric', 'stepped');

-- Table storing platform-provided grinder presets
create table public.default_grinders (
  id uuid not null default gen_random_uuid(),
  name text not null,
  brand text,
  scale_type grinder_scale_type not null default 'text',
  default_notation text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  constraint default_grinders_pkey primary key (id)
);

create unique index default_grinders_name_brand_idx
  on public.default_grinders (lower(name), coalesce(lower(brand), ''));

-- Table storing user-specific grinders
create table public.user_grinders (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  brand text,
  scale_type grinder_scale_type not null default 'text',
  default_notation text,
  notes text,
  created_at timestamptz not null default now(),
  constraint user_grinders_pkey primary key (id),
  constraint user_grinders_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

create index user_grinders_user_id_idx on public.user_grinders (user_id, created_at desc);

-- Link recipes to grinders and track recent grind strings
alter table public.recipes
  add column grinder_id uuid null references public.user_grinders (id) on delete set null;

create index recipes_grinder_id_idx on public.recipes (grinder_id);

create table public.recent_grinds (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  grind text not null,
  created_at timestamptz not null default now(),
  constraint recent_grinds_pkey primary key (id)
);

create index recent_grinds_user_id_idx on public.recent_grinds (user_id, created_at desc);

alter table public.recent_grinds enable row level security;

create policy "Users can view their recent grinds" on public.recent_grinds
  for select using (auth.uid() = user_id);

create policy "Users can insert their recent grinds" on public.recent_grinds
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their recent grinds" on public.recent_grinds
  for delete using (auth.uid() = user_id);

-- Row Level Security
alter table public.user_grinders enable row level security;

create policy "Users can view their grinders" on public.user_grinders
  for select using (auth.uid() = user_id);

create policy "Users can insert their grinders" on public.user_grinders
  for insert with check (auth.uid() = user_id);

create policy "Users can update their grinders" on public.user_grinders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their grinders" on public.user_grinders
  for delete using (auth.uid() = user_id);

-- Default data seeds can be inserted manually or via scripts later
insert into public.default_grinders (name, brand, scale_type, default_notation)
values
  ('Comandante C40', 'Comandante', 'numeric', '20 clicks'),
  ('Fellow Ode Gen 2', 'Fellow', 'stepped', 'Setting 3.5'),
  ('EK43', 'Mahlkönig', 'numeric', '7.5'),
  ('Baratza Encore', 'Baratza', 'numeric', '18'),
  ('Timemore Chestnut X', 'Timemore', 'numeric', '12 clicks'),
  ('Origami Hand Grinder', 'Origami', 'numeric', '25 clicks')
on conflict do nothing;
