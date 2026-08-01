-- Create campaigns table
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  redirect_type text not null check (redirect_type in ('default_products', 'custom_link')),
  redirect_url text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'active', 'expired')),
  display_order integer not null default 0,
  media jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes
create index if not exists campaigns_status_idx on public.campaigns(status);
create index if not exists campaigns_start_date_idx on public.campaigns(start_date);
create index if not exists campaigns_end_date_idx on public.campaigns(end_date);
create index if not exists campaigns_display_order_idx on public.campaigns(display_order);

-- Enable RLS
alter table public.campaigns enable row level security;

-- Public read for active campaigns
create policy "Public read active campaigns" on public.campaigns 
  for select using (
    start_date <= now() and end_date >= now()
  );

-- Function to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for updated_at
create trigger on_campaigns_updated
  before update on public.campaigns
  for each row
  execute function public.handle_updated_at();
