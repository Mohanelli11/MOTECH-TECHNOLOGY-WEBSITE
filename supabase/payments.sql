-- MOTECH payments (Paystack). Run once in Supabase -> SQL Editor, AFTER schema.sql.
-- Safe to re-run.

-- 1. Prices the server trusts (the browser never decides what is charged).
create table if not exists public.product_prices (
  id         text primary key,
  name       text not null,
  price      numeric(12,2) not null check (price >= 0),
  currency   text not null default 'KES',
  status     text not null default 'available' check (status in ('available','preorder','disabled')),
  updated_at timestamptz not null default now()
);

insert into public.product_prices (id, name, price, status) values
  ('prd-sem-100', 'Smart Energy Meter SEM-100', 18500, 'available'),
  ('prd-brz-200', 'Smart Breathalyzer BRZ-200', 96000, 'available'),
  ('prd-pql-300', 'Power Quality Data Logger PQL-300', 245000, 'available'),
  ('prd-rmf-400', 'ROAMfi Secure Network Node', 34500, 'available'),
  ('prd-doc-sem', 'Smart Metering Engineering Package', 125000, 'available'),
  ('prd-doc-pq', 'Power Quality Audit Toolkit', 68000, 'preorder')
on conflict (id) do nothing;

-- 2. Orders (created ONLY by the paystack-init Edge Function).
create table if not exists public.orders (
  id           text primary key,
  reference    text not null unique,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  product_id   text not null,
  product_name text not null,
  amount       numeric(12,2) not null,
  currency     text not null default 'KES',
  status       text not null default 'awaiting_payment' check (status in ('awaiting_payment','verified','rejected')),
  created_at   timestamptz not null default now(),
  paid_at      timestamptz,
  paystack_id  text,
  channel      text,
  license_id   text,
  admin_note   text not null default ''
);
create index if not exists orders_user_idx on public.orders(user_id);

-- 3. Licences (created ONLY by the Edge Functions after a verified payment).
create table if not exists public.licenses (
  id         text primary key,
  order_id   text not null unique references public.orders(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id text not null,
  issued_at  timestamptz not null default now(),
  status     text not null default 'active' check (status in ('active','deactivated'))
);
create index if not exists licenses_user_idx on public.licenses(user_id);

-- 4. Row-level security.
alter table public.product_prices enable row level security;
alter table public.orders         enable row level security;
alter table public.licenses       enable row level security;

drop policy if exists prices_read on public.product_prices;
create policy prices_read on public.product_prices for select using (true);
drop policy if exists prices_admin_write on public.product_prices;
create policy prices_admin_write on public.product_prices for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists orders_read on public.orders;
create policy orders_read on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists licenses_read on public.licenses;
create policy licenses_read on public.licenses for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists licenses_admin_update on public.licenses;
create policy licenses_admin_update on public.licenses for update
  using (public.is_admin()) with check (public.is_admin());

-- 5. Grants: customers can only READ; nobody but the server (service role) can create orders/licences.
revoke all on public.orders, public.licenses from anon, authenticated;
grant select on public.orders, public.licenses to authenticated;
grant update (status, admin_note) on public.orders to authenticated;
grant update (status) on public.licenses to authenticated;
revoke all on public.product_prices from anon, authenticated;
grant select on public.product_prices to anon, authenticated;
grant insert, update, delete on public.product_prices to authenticated;
