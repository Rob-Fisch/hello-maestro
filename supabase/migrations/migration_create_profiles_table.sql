-- Migration: Create Profiles Table
-- This table stores public-facing profile information for users
-- Required for the Stage Plot feature to display artist information

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT,
    website_url TEXT,
    tip_url TEXT,
    mailing_list_url TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for users to manage their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can manage their own profile' 
        AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Users can manage their own profile" 
        ON public.profiles 
        FOR ALL 
        USING (auth.uid() = id);
    END IF;
END $$;

-- 4. Create policy for public read access (needed for Stage Plot)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public profiles are visible to everyone' 
        AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Public profiles are visible to everyone" 
        ON public.profiles 
        FOR SELECT 
        USING (true);
    END IF;
END $$;

-- 5. Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            NEW.raw_user_meta_data->>'full_name',
            NEW.email,
            'Musician'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Backfill existing users (create profiles for users who don't have one)
INSERT INTO public.profiles (id, display_name)
SELECT 
    id,
    COALESCE(
        raw_user_meta_data->>'display_name',
        raw_user_meta_data->>'full_name',
        email,
        'Musician'
    ) as display_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
