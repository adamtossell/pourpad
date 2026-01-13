-- Add process type and roasted date to user_coffees
alter table public.user_coffees
  add column process_type text,
  add column roasted_date date;
