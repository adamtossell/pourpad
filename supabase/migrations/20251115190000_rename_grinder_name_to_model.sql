-- Rename grinder `name` columns to `model` for clearer semantics
alter table public.default_grinders rename column name to model;
alter table public.user_grinders rename column name to model;

-- Update supporting index names to reflect the new column name
alter index if exists default_grinders_name_brand_idx rename to default_grinders_model_brand_idx;
