-- Add shipping address support to orders for existing databases
alter table if exists public.orders
  add column if not exists address text not null default '';
