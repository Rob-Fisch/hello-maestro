-- Allow public access to events marked as public (Stage Plot feature)
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
