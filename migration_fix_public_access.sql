-- 1. Allow public access to public routines
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public routines are visible to everyone' 
        AND tablename = 'routines'
    ) THEN
        CREATE POLICY "Public routines are visible to everyone" 
        ON public.routines FOR SELECT 
        USING (is_public = true);
    END IF;
END $$;

-- 2. Allow public access to profiles (needed to see teacher name/avatar)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Enable RLS if not already (safeguard)
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
