-- =========================================
-- Campaign Monitoring Queries
-- =========================================
-- Check spots claimed for active campaign
SELECT code,
    name,
    lifetime_claimed || ' / ' || lifetime_limit as lifetime,
    trial_claimed || ' / ' || trial_limit as trial,
    is_active
FROM public.campaigns
WHERE code = '2026-01-28';
-- =========================================
-- See who signed up from the campaign
SELECT email,
    created_at,
    raw_user_meta_data->>'is_premium' as is_premium,
    raw_user_meta_data->>'pro_expires_at' as pro_expires_at,
    raw_user_meta_data->>'signup_campaign' as campaign
FROM auth.users
WHERE raw_user_meta_data->>'signup_campaign' = '2026-01-28'
ORDER BY created_at DESC;
-- =========================================
-- Check waitlist signups
SELECT email,
    name,
    instruments,
    genres,
    created_at
FROM public.waitlist
WHERE campaign_code = '2026-01-28'
ORDER BY created_at DESC;
-- =========================================
-- All campaigns overview
SELECT code,
    name,
    lifetime_claimed || ' / ' || lifetime_limit as lifetime_spots,
    trial_claimed || ' / ' || trial_limit as trial_spots,
    CASE
        WHEN is_active THEN '✅ Active'
        ELSE '❌ Ended'
    END as status
FROM public.campaigns
ORDER BY created_at DESC;