-- Migration: Add Transactions Table (Finance Sync) [FIXED]
-- Run this in Supabase SQL Editor

-- 1. Create Transactions Table
create table if not exists public.transactions (
  id text primary key, -- UUID string from frontend
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null, -- YYYY-MM-DD
  amount numeric(10, 2) not null,
  type text check (type in ('income', 'expense')) not null,
  category text not null,
  description text,
  related_event_id text, -- Optional link to event
  receipt_uri text, -- Optional local/remote path
  created_at timestamptz default now(), -- Corrected type
  last_synced_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.transactions enable row level security;

-- 3. RLS Policies
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
