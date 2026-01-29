# Campaign Codes

Internal reference for mapping campaign URLs to marketing campaigns.

## Campaign URL Format

All campaigns use the format: `/join/YYYY-MM-DD`

Example: `https://opusmode.net/join/2026-01-28`

## Active Campaigns

| Code | Campaign Name | Target Platform | Lifetime | Trial | Status |
|------|---------------|-----------------|----------|-------|--------|
| 2026-01-28 | Jazz in the Catskills | Facebook | 25 | 75 | **LIVE** |

---

## Rollout Plan: 2026-01-28

### Target Groups

1. **Jazz in the Catskills** (Facebook, 326 members, public) — Post first
2. **[Community Board TBD]** (Facebook, 20K members, private) — Post after 1 week

### Post Template (Group 1)

> **Looking for a few volunteers**
> 
> Some of you know me — I have built an app that some of you may be interested in. It is designed to track practice, manage gigs, and keep music life organized.
> 
> I am looking for **25 musicians** to test it and give honest feedback. You get Lifetime Pro free.
> 
> https://opusmode.net/join/2026-01-28

**Attach image:** `musician_volunteers_wanted.png` (in this folder)

### Post Template (Group 2 — Community Board)

> **🎵 Musician Volunteers Wanted**
> 
> Hey neighbors! I'm a software developer and musician from [your town]. I've been building an app to help gigging musicians organize their practice, manage performances, and track their music career.
> 
> I'm looking for **25 local musicians** to try it out and give honest feedback. In exchange, you get **Lifetime Pro access** — free forever.
> 
> No catch, no credit card. Just looking for real feedback from real players.
> 
> https://opusmode.net/join/2026-01-28

### Monitoring

```sql
-- Check spots claimed
SELECT lifetime_claimed, trial_claimed FROM public.campaigns WHERE code = '2026-01-28';

-- See who signed up
SELECT email, created_at, raw_user_meta_data->>'signup_campaign' as campaign
FROM auth.users 
WHERE raw_user_meta_data->>'signup_campaign' = '2026-01-28'
ORDER BY created_at DESC;
```

### Campaign Log

| Date | Time | Event |
|------|------|-------|
| Jan 28, 2026 | 7:24 PM | Post published to Jazz in the Catskills (Facebook) |
| | | Post approved after moderation |

---

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
