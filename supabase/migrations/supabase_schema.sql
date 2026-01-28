-- Hello Maestro: Supabase Cloud Schema
-- Run this in your Supabase SQL Editor to enable Puddle-Proofing!

-- 2. Blocks Table
CREATE TABLE IF NOT EXISTS public.blocks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    category_id TEXT,
    content TEXT,
    tags TEXT[],
    media_uri TEXT,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only access their own blocks' AND tablename = 'blocks') THEN
        CREATE POLICY "Users can only access their own blocks" ON public.blocks FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Routines Table
CREATE TABLE IF NOT EXISTS public.routines (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    blocks JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    last_synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS schedule JSONB;

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only access their own routines' AND tablename = 'routines') THEN
        CREATE POLICY "Users can only access their own routines" ON public.routines FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS fee TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS routines TEXT[] DEFAULT '{}';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS personnel_ids TEXT[] DEFAULT '{}';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS schedule JSONB;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slots JSONB DEFAULT '[]';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS total_fee TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS musician_fee TEXT;


ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only access their own events' AND tablename = 'events') THEN
        CREATE POLICY "Users can only access their own events" ON public.events FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only access their own categories' AND tablename = 'categories') THEN
        CREATE POLICY "Users can only access their own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. People Table
CREATE TABLE IF NOT EXISTS public.people (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT,
    phone TEXT,
    email TEXT,
    source TEXT DEFAULT 'maestro',
    native_id TEXT,
    last_synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.people ADD COLUMN IF NOT EXISTS instruments TEXT[] DEFAULT '{}';
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS verified_phone TEXT;

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only access their own people' AND tablename = 'people') THEN
        CREATE POLICY "Users can only access their own people" ON public.people FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. Gear Assets Table
CREATE TABLE IF NOT EXISTS public.gear_assets (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    manufacture_year TEXT,
    status TEXT NOT NULL,
    is_wishlist BOOLEAN DEFAULT false,
    notes TEXT,
    financials JSONB DEFAULT '{}',
    loan_details JSONB,
    media JSONB DEFAULT '{"photoUris": []}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gear_assets ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only access their own gear' AND tablename = 'gear_assets') THEN
        CREATE POLICY "Users can only access their own gear" ON public.gear_assets FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8. Pack Lists Table
CREATE TABLE IF NOT EXISTS public.pack_lists (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    item_ids TEXT[] DEFAULT '{}',
    checked_item_ids TEXT[] DEFAULT '{}',
    notes TEXT,
    last_synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pack_lists ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only access their own pack lists' AND tablename = 'pack_lists') THEN
        CREATE POLICY "Users can only access their own pack lists" ON public.pack_lists FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
