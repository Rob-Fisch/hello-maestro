-- Fix RLS Policies for Public Stage Plot Access
-- The issue: The base policy "Users can only access their own events" blocks unauthenticated access
-- Solution: Drop the old policy and create separate policies for authenticated and public access

-- 1. Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can only access their own events" ON public.events;

-- 2. Create policy for authenticated users to access their own events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Authenticated users can access own events' 
        AND tablename = 'events'
    ) THEN
        CREATE POLICY "Authenticated users can access own events" 
        ON public.events 
        FOR ALL 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Ensure the public access policy exists (should already be there from previous migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public events are visible to everyone' 
        AND tablename = 'events'
    ) THEN
        CREATE POLICY "Public events are visible to everyone" 
        ON public.events 
        FOR SELECT 
        USING (is_public_stage_plot = true);
    END IF;
END $$;
