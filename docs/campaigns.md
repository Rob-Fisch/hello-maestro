# Campaign Codes

Internal reference for mapping campaign URLs to marketing campaigns.

## Campaign URL Format

All campaigns use the format: `/join/YYYY-MM-DD`

Example: `https://opusmode.net/join/2026-01-28`

## Active Campaigns

| Code | Campaign Name | Target Platform | Lifetime | Trial | Status |
|------|---------------|-----------------|----------|-------|--------|
| 2026-01-28 | FB Jazz Guitarists | Facebook | 25 | 75 | Planned |

## Setting Up a New Campaign

1. Add a row to the `campaigns` table in Supabase:
   ```sql
   INSERT INTO public.campaigns (code, name, lifetime_limit, trial_limit)
   VALUES ('2026-01-28', 'FB Jazz Guitarists', 25, 75);
   ```

2. Post your recruitment message with the campaign link

3. Track signups in Supabase using:
   ```sql
   SELECT * FROM public.campaigns WHERE code = '2026-01-28';
   SELECT * FROM public.waitlist WHERE campaign_code = '2026-01-28';
   ```

## Tier Logic

| Order | Tier | Pro Status | Days |
|-------|------|------------|------|
| 1-25 | Lifetime Pro | `is_premium: true` | Expires 2125-01-01 |
| 26-100 | 30-Day Trial | `is_premium: true` | Expires in 30 days |
| 101+ | Waitlist | Free tier | N/A |

## Future: Discount Campaigns

The database has placeholder fields for future discount campaigns:
- `discount_percent` - e.g., 50 for 50% off
- `discount_code` - Lemon Squeezy discount code
- `discount_limit` - How many can redeem
- `discount_claimed` - Counter
