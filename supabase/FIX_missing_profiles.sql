-- Run this in Supabase → SQL Editor if you see:
-- "Could not find the table 'public.profiles' in the schema cache"

-- 1) Profiles table (required for login)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null unique,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;

create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Service role (your Express server) bypasses RLS automatically.

-- 2) Reload PostgREST schema cache (Supabase API)
notify pgrst, 'reload schema';
