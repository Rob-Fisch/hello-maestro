-- Migration: Add Stage Plot (Public Event Sharing) Columns
-- This migration adds the necessary columns for the Stage Plot feature,
-- which allows musicians to share public event pages with fans.

-- 1. Add Stage Plot columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_public_stage_plot BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_description TEXT,
ADD COLUMN IF NOT EXISTS show_setlist BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS social_link TEXT;

-- 2. Create RLS policy for public event access
-- This allows unauthenticated users to view events marked as public
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public events are visible to everyone' 
        AND tablename = 'events'
    ) THEN
        CREATE POLICY "Public events are visible to everyone" 
        ON public.events FOR SELECT 
        USING (is_public_stage_plot = true);
    END IF;
END $$;

-- 3. Ensure profiles table has public access policy (needed for artist info)
-- Only if the profiles table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Enable RLS on profiles if not already enabled
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE policyname = 'Public profiles are visible to everyone' 
            AND tablename = 'profiles'
        ) THEN
            CREATE POLICY "Public profiles are visible to everyone" 
            ON public.profiles FOR SELECT 
            USING (true);
        END IF;
    END IF;
END $$;

-- 4. Ensure routines table has public access policy (needed for setlist display)
-- Only if the routines table exists and has is_public column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'routines') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE policyname = 'Public routines are visible to everyone' 
            AND tablename = 'routines'
        ) THEN
            CREATE POLICY "Public routines are visible to everyone" 
            ON public.routines FOR SELECT 
            USING (is_public = true);
        END IF;
    END IF;
END $$;
