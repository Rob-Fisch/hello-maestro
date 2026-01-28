-- Migration: Add Business Features (Finance & Fan Data) [FIXED]

-- 1. Create Event Finance Table (Extension of Events)
create table if not exists public.event_finance (
  event_id text references public.events(id) on delete cascade primary key, -- CHANGED to text
  agreed_pay numeric(10, 2) default 0,
  actual_pay numeric(10, 2) default 0,
  tips numeric(10, 2) default 0,
  payment_status text check (payment_status in ('unpaid', 'deposit_received', 'paid', 'cancelled')) default 'unpaid',
  payment_method text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Expenses Table
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_id text references public.events(id) on delete set null, -- CHANGED to text
  category text check (category in ('travel', 'gear', 'food', 'marketing', 'lodging', 'software', 'other')) default 'other',
  amount numeric(10, 2) not null,
  currency text default 'USD',
  date date default current_date,
  description text,
  receipt_url text,
  is_tax_deductible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Contacts Table (Fan Magnet)
-- (No changes needed here, user_id is definitely a UUID from Supabase Auth)
create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  email text,
  phone text,
  source text,
  tags text[],
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS
alter table public.event_finance enable row level security;
alter table public.expenses enable row level security;
alter table public.contacts enable row level security;

-- 5. RLS Policies

-- Event Finance
create policy "Users can view finance for their events"
  on public.event_finance for select
  using ( exists (select 1 from public.events where id = event_finance.event_id and user_id = auth.uid()) );

create policy "Users can edit finance for their events"
  on public.event_finance for all
  using ( exists (select 1 from public.events where id = event_finance.event_id and user_id = auth.uid()) );

-- Expenses
create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- Contacts
create policy "Users can view own contacts"
  on public.contacts for select
  using (auth.uid() = user_id);

create policy "Users can manage own contacts"
  on public.contacts for all
  using (auth.uid() = user_id);
