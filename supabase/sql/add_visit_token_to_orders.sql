alter table public.orders
  add column if not exists visit_token text;

create index if not exists orders_table_visit_created_idx
  on public.orders (table_id, visit_token, created_at desc);
