-- Add email column to public.queries table
alter table public.queries add column if not exists email text;
