-- Ensure row level security is enforced on default grinders and seed curated presets

alter table public.default_grinders enable row level security;

do $$
begin
  -- Create or replace a read-only policy for authenticated users
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'default_grinders'
      and policyname = 'Authenticated users can read default grinders'
  ) then
    create policy "Authenticated users can read default grinders"
      on public.default_grinders
      for select
      to authenticated
      using (true);
  end if;
end $$;

-- Reset existing presets to avoid duplicates
delete from public.default_grinders;

-- Seed curated grinder presets
insert into public.default_grinders (brand, model, scale_type, default_notation)
values
  ('Comandante', 'C40 MK4', 'stepped', '24 clicks'),
  ('Fellow', 'Ode Gen 2', 'numeric', '4.0'),
  ('Baratza', 'Encore ESP', 'numeric', '20'),
  ('Baratza', 'Vario+', 'numeric', '2E'),
  ('Hario', 'Skerton Pro', 'stepped', '8 clicks'),
  ('Timemore', 'Chestnut X', 'stepped', '18 clicks'),
  ('Timemore', 'Sculptor 064S', 'numeric', '45'),
  ('1Zpresso', 'J Ultra', 'stepped', '18 clicks'),
  ('Eureka', 'Mignon Specialita', 'numeric', '1.5'),
  ('Mahlkönig', 'EK43', 'numeric', '7.5'),
  ('Option-O', 'Lagom P64', 'numeric', '45'),
  ('Weber Workshops', 'Key Grinder', 'numeric', '35'),
  ('Mazzer', 'ZM Digital', 'numeric', '450');
