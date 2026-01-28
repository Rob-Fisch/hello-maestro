-- Migration: Early Access Campaign System
-- Creates tables for campaign tracking, waitlist capture, and early adopter rewards
-- 1. Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    code TEXT PRIMARY KEY,
    -- e.g., '2026-01-28'
    name TEXT NOT NULL,
    -- e.g., 'FB Jazz Guitarists'
    lifetime_limit INTEGER DEFAULT 25,
    trial_limit INTEGER DEFAULT 75,
    lifetime_claimed INTEGER DEFAULT 0,
    trial_claimed INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    -- Future discount placeholders
    discount_percent INTEGER,
    -- e.g., 50 for 50% off
    discount_code TEXT,
    -- Lemon Squeezy discount code
    discount_limit INTEGER,
    -- How many can claim
    discount_claimed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 2. Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT,
    instruments TEXT [],
    genres TEXT [],
    campaign_code TEXT REFERENCES public.campaigns(code),
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 3. Enable RLS on campaigns table
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
-- 4. Create policy for public read access to campaigns (needed for landing page)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Campaigns are publicly readable'
        AND tablename = 'campaigns'
) THEN CREATE POLICY "Campaigns are publicly readable" ON public.campaigns FOR
SELECT USING (true);
END IF;
END $$;
-- 5. Enable RLS on waitlist table
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
-- 6. Create policy for public insert to waitlist (anyone can sign up)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Anyone can join waitlist'
        AND tablename = 'waitlist'
) THEN CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR
INSERT WITH CHECK (true);
END IF;
END $$;
-- 7. Create function to atomically claim a campaign spot
-- Returns: 'lifetime', 'trial', or 'waitlist' based on availability
CREATE OR REPLACE FUNCTION public.claim_campaign_spot(campaign_code TEXT) RETURNS TEXT AS $$
DECLARE campaign_record RECORD;
result TEXT;
BEGIN -- Lock the row for update to prevent race conditions
SELECT * INTO campaign_record
FROM public.campaigns
WHERE code = campaign_code
    AND is_active = true FOR
UPDATE;
IF NOT FOUND THEN RETURN 'invalid';
END IF;
-- Check lifetime spots first
IF campaign_record.lifetime_claimed < campaign_record.lifetime_limit THEN
UPDATE public.campaigns
SET lifetime_claimed = lifetime_claimed + 1
WHERE code = campaign_code;
RETURN 'lifetime';
END IF;
-- Check trial spots
IF campaign_record.trial_claimed < campaign_record.trial_limit THEN
UPDATE public.campaigns
SET trial_claimed = trial_claimed + 1
WHERE code = campaign_code;
RETURN 'trial';
END IF;
-- All spots taken
RETURN 'waitlist';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;