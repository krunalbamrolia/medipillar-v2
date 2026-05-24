-- =============================================================================
-- MediPillar — RUN ONCE in Supabase Dashboard → SQL Editor
-- Fixes: PGRST205 "Could not find the table 'public.xxx' in the schema cache"
-- Safe to re-run (idempotent)
-- =============================================================================

-- Extensions (usually already enabled on Supabase)
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- TABLES (order matters for foreign keys)
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null unique,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table if exists public.profiles
  add column if not exists is_active boolean not null default true;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  logo_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sub_name text default '',
  description text default '',
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists medicines_company_id_idx on public.medicines(company_id);
create index if not exists medicines_category_id_idx on public.medicines(category_id);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  unique (user_id, medicine_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  medicine_id uuid not null references public.medicines(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  tracked boolean not null default false
);

alter table if exists public.order_items
  add column if not exists tracked boolean not null default false;

create table if not exists public.queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- API access (PostgREST / Supabase client)
-- -----------------------------------------------------------------------------

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

alter default privileges in schema public
  grant all on tables to postgres, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.categories enable row level security;
alter table public.medicines enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.queries enable row level security;

-- Drop old policies so this script can be re-run safely
drop policy if exists "Public read companies" on public.companies;
drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Public read medicines" on public.medicines;
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users manage own cart" on public.cart_items;
drop policy if exists "Users read own orders" on public.orders;
drop policy if exists "Users create own orders" on public.orders;
drop policy if exists "Users read own order items" on public.order_items;
drop policy if exists "Anyone can submit query" on public.queries;
drop policy if exists "Users read own queries" on public.queries;

create policy "Public read companies" on public.companies for select using (true);
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read medicines" on public.medicines for select using (true);

create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users manage own cart" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users create own orders" on public.orders for insert with check (auth.uid() = user_id);

create policy "Users read own order items" on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Anyone can submit query" on public.queries for insert with check (true);
create policy "Users read own queries" on public.queries for select
  using (user_id is null or auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Reload PostgREST schema cache (fixes PGRST205 after creating tables)
-- -----------------------------------------------------------------------------

notify pgrst, 'reload schema';

-- Verify (optional — shows in SQL results)
select tablename from pg_tables where schemaname = 'public' order by tablename;
