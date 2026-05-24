-- Admin tracking checkbox per order line item
alter table if exists public.order_items
  add column if not exists tracked boolean not null default false;

create index if not exists order_items_tracked_idx on public.order_items (tracked);
