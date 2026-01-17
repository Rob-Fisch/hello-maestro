-- Migration: Add Performer Page and Structured Venue Address
-- This migration adds fields for the Performer Page feature and 
-- restructures venue data for better address handling

-- 1. Add structured venue address fields
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS venue_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS venue_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS venue_city TEXT,
ADD COLUMN IF NOT EXISTS venue_state_province TEXT,
ADD COLUMN IF NOT EXISTS venue_postal_code TEXT,
ADD COLUMN IF NOT EXISTS venue_country TEXT;

-- 2. Add Performer Page logistics fields
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS load_in_time TEXT,
ADD COLUMN IF NOT EXISTS soundcheck_time TEXT,
ADD COLUMN IF NOT EXISTS is_performer_page_enabled BOOLEAN DEFAULT false;

-- 3. Rename Stage Plot column to Performance Promo
-- Note: This will fail if the column doesn't exist, so we check first
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events' 
        AND column_name = 'is_public_stage_plot'
    ) THEN
        ALTER TABLE public.events RENAME COLUMN is_public_stage_plot TO is_public_promo;
    END IF;
END $$;

-- 4. Add is_public_promo column if it doesn't exist (for new databases)
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_public_promo BOOLEAN DEFAULT false;

-- 5. Update RLS policy for Performance Promo (public access)
DROP POLICY IF EXISTS "Public events are visible to everyone" ON public.events;
DROP POLICY IF EXISTS "Public promo events are visible to everyone" ON public.events;

CREATE POLICY "Public promo events are visible to everyone" 
ON public.events FOR SELECT 
USING (is_public_promo = true);

-- 6. Create RLS policy for Performer Page (authenticated access only)
DROP POLICY IF EXISTS "Performer pages require authentication" ON public.events;

CREATE POLICY "Performer pages require authentication" 
ON public.events FOR SELECT 
USING (
    is_performer_page_enabled = true 
    AND auth.uid() IS NOT NULL
);
