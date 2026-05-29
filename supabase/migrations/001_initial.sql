-- ============================================================
-- FINANCIAL-PRO — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── 1. ASSETS ──────────────────────────────────────────────
create table if not exists public.assets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  ticker        text,
  asset_type    text not null default 'other',  -- stock|crypto|etf|real_estate|savings|other
  quantity      numeric not null default 1,
  buy_price     numeric not null default 0,
  current_value numeric not null default 0,
  currency      text not null default 'EUR',
  notes         text,
  source        text,   -- 'manual' | 'csv' | 'binance' | 'trading212' ...
  external_id   text,   -- ID externe (ex: symbole Binance)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- RLS
alter table public.assets enable row level security;

create policy "Users can see their own assets"
  on public.assets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own assets"
  on public.assets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own assets"
  on public.assets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own assets"
  on public.assets for delete
  using (auth.uid() = user_id);

-- Auto update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger assets_updated_at
  before update on public.assets
  for each row execute procedure public.handle_updated_at();


-- ── 2. PORTFOLIO SNAPSHOTS (historique pour graphiques) ───
create table if not exists public.portfolio_snapshots (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  total_value numeric not null,
  created_at  timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.portfolio_snapshots enable row level security;

create policy "Users can see their own snapshots"
  on public.portfolio_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own snapshots"
  on public.portfolio_snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own snapshots"
  on public.portfolio_snapshots for update
  using (auth.uid() = user_id);


-- ── 3. API CONNECTIONS ─────────────────────────────────────
create table if not exists public.api_connections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  provider     text not null,  -- 'binance' | 'coinbase' | 'trading212' ...
  credentials  jsonb,          -- chiffré côté Edge Function
  status       text default 'active',
  last_sync    timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.api_connections enable row level security;

create policy "Users can manage their own connections"
  on public.api_connections for all
  using (auth.uid() = user_id);


-- ── 4. SAVINGS ENTRIES (livrets avec montants saisis) ─────
create table if not exists public.savings_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  account_id text not null,   -- ex: 'livret_a', 'lep', 'cashbee' ...
  amount     numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, account_id)
);

alter table public.savings_entries enable row level security;

create policy "Users can manage their savings entries"
  on public.savings_entries for all
  using (auth.uid() = user_id);


-- ── 5. DELETE USER DATA (RPC pour suppression de compte) ──
create or replace function public.delete_user_data()
returns void
language plpgsql security definer
as $$
declare
  uid uuid := auth.uid();
begin
  delete from public.assets where user_id = uid;
  delete from public.portfolio_snapshots where user_id = uid;
  delete from public.api_connections where user_id = uid;
  delete from public.savings_entries where user_id = uid;
  -- La suppression du compte auth.users se fait via Supabase Dashboard ou Admin API
end;
$$;


-- ── 6. INDEX pour performances ─────────────────────────────
create index if not exists idx_assets_user_id on public.assets(user_id);
create index if not exists idx_snapshots_user_date on public.portfolio_snapshots(user_id, date);
create index if not exists idx_savings_user on public.savings_entries(user_id);
