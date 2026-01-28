# OpusMode Product Strategy

> Business positioning, monetization philosophy, and strategic direction.

---

## Monetization Philosophy

**Free practice, monetize when earning.**

Practice room features (Studio, Practice Tracking) are generous and free to build user base. We monetize when musicians start earning money — gigs, venues, finance tracking, set list management for paid performances.

**Target Market**: Weekend Warriors + Pro musicians (anyone earning from gigs).

---

## Pricing Structure

| Tier | Monthly | Annual | Status |
|------|---------|--------|--------|
| Free | $0 | $0 | Live |
| Pro | $9.99 | $99 | Live (Lemon Squeezy) |
| Pro+ | $19.99 | $199 | Pending |

---

## "Two Islands" Sync Strategy

**Implemented January 2026**

Free users sync within their platform only (Web OR Native App). Pro users get full cross-platform sync.

- `web` = Any browser (Safari, Chrome, Firefox) on any device
- `native` = iOS App Store / Android Play Store apps

**Intentional Loophole**: PWA on iPhone = `platform: 'web'`. If users are savvy enough to figure this out, they've earned it.

**Upgrade Incentive**: Users who want laptop (web) AND phone (native app) must upgrade to Pro.

---

## MVP Strategy

**MVP = PWA (Web) Only**

Native iOS/Android apps are post-MVP. Initial launch targets Progressive Web App users.

**PWA Advantages**:
- Single codebase, instant deployment
- No App Store review delays
- Works on iOS, Android, and desktop
- Users can install to home screen

**Post-MVP Native Plans**:
- iOS App Store submission after MVP validation
- Android Play Store concurrent with iOS
- "Two Islands" sync activates when native apps launch

---

## Pro+ Tier Rationale

Pro+ exists primarily to:
1. Enforce reasonable storage limits
2. Prevent abuse (e.g., users uploading entire college PDF libraries)
3. Provide premium features for established artists (custom branding, priority support)

"Unlimited" claims on website need qualification.

---

## Feature Philosophy Notes

### Roster Naming
"Roster" is a placeholder term. Need better generic label that works for bands, chamber groups, orchestras, freelancers, subs, etc.

### Studio vs Stage
| | THE STUDIO | THE STAGE (SetLists) |
|---|---|---|
| What it stores | Musical notation, exercises, written music | Song metadata — name, key, instructions |
| Purpose | Practice, learn, study | Coordinate a performance |
| Output | View/print notation | Share gig plan with band |
