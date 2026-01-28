-- Create Songs Table
create table songs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  artist text,
  key text,
  bpm integer,
  duration_seconds integer,
  links jsonb, -- [{ label, url }]
  notes text,
  tags text[],
  created_at timestamptz default now(),
  deleted_at timestamptz,
  last_synced_at timestamptz
);

-- Create Set Lists Table
create table set_lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  event_id text references events(id), -- Changed to TEXT to match legacy events table
  items jsonb, -- [{ type: 'song', songId: uuid, note: 'Skip intro' }, { type: 'break', label: '15 min' }]
  created_at timestamptz default now(),
  deleted_at timestamptz,
  last_synced_at timestamptz
);

-- Enable RLS
alter table songs enable row level security;
alter table set_lists enable row level security;

-- Create Policies for Songs
create policy "Users can view their own songs"
  on songs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own songs"
  on songs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own songs"
  on songs for update
  using (auth.uid() = user_id);

-- Create Policies for Set Lists
create policy "Users can view their own set lists"
  on set_lists for select
  using (auth.uid() = user_id);

create policy "Users can insert their own set lists"
  on set_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own set lists"
  on set_lists for update
  using (auth.uid() = user_id);
