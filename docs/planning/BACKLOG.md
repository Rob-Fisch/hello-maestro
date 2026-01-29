# OpusMode Feature Backlog

> Single source of truth for actionable work. For pricing strategy and feature matrix, see [`PRICING_TIERS.md`](file:///Users/robfisch/Documents/OpusMode/docs/strategy/PRICING_TIERS.md).

**Priority**: 1 = High, 2 = Medium, 3 = Low  
**Status**: ⬜ Open, 🔄 In Progress, ✅ Done

---

## ⏭️ Next Session

- [x] **Plain-Language Pricing Copy** — ✅ Completed 2026-01-25. Rewrote landing page copy using everyday language. New hero: "OpusMode: The Missing Toolkit For Musicians". Replaced Navigator references with AI benefit language, simplified pricing features, used "leads" instead of "gigs".

---

## Early Adopter Feedback Program

| # | Pri | Feature | Description | Tier | Status | Created | Completed |
|---|-----|---------|-------------|------|--------|---------|-----------|
| 1 | 2 | **Staged Google Forms** | Different feedback forms for user checkpoints (Day 1-7, Day 30+, Evergreen) | — | ⬜ | 01-25 | |
| 2 | 2 | **In-App Feedback Prompts** | Periodic prompts for promo users with links to Google Forms | — | ⬜ | 01-25 | |
| 3 | 3 | **Settings Link** | Add evergreen "Give Feedback" link in Settings | — | ⬜ | 01-25 | |
| 4 | 2 | **Navigator Query Pack Marketing** | General strategy for in-app purchase visibility, placement, and messaging for Navigator Query Packs. Currently shows usage + Buy 10-Pack link after first query. | — | ⬜ | 01-27 | |
| 5 | 1 | **Upgrade Page Marketing Content** | Beef up content on Upgrade modal with better headlines, feature benefits, and Pro/Pro+ comparison. Contextual triggers already implemented. | — | ⬜ | 01-27 | |
| 6 | 1 | **Home Page Footer → Site Map** | "Everything You Need" graphic at bottom of home page is non-functional. Make it link to the Site Map (Help page). | — | ✅ | 01-27 | 01-28 |
| 7 | 2 | **Signed-Out Landing Page** | Show marketing/landing page at `/` when not logged in, instead of redirecting to auth. Reduces friction during development and improves UX for new visitors. | — | ⬜ | 01-28 | |

---

## Feature Enhancements

| # | Pri | Feature | Description | Tier | Status | LOE | Created | Completed |
|---|-----|---------|-------------|------|--------|-----|---------|-----------|
| 4 | 1 | **Chord Chart Builder** | Quick cheat sheet generator with grid-based entry. See [details](#chord-chart-builder-details). | Free | ⬜ | 5-8d | 01-25 | |
| 5 | 1 | **Lyrics Storage / Teleprompter** | Scrollable lyrics view for vocalists, add `lyrics` field to Songs | Free | ⬜ | 2-3d | 01-25 | |
| 6 | 2 | **Tempo Trainer (Smart Metronome)** | Progressive tempo building tool in The Studio via Web Audio API | Free | ⬜ | 4-6d | 01-25 | |
| 7 | 2 | **In-App Practice Mode (PDF Viewer)** | View routines/library artifacts on screen without export. See [details](#pdf-viewer-details). | Free | ⬜ | 3-4d | 01-25 | |
| 8 | 2 | **Copy Events** | Duplicate an existing event to quickly create a new one | Free | ⬜ | — | 01-25 | |
| 9 | 3 | **Venue Assignment to Gigs** | Select venue from Contacts to auto-fill gig location | Free | ⬜ | — | 01-25 | |
| 10 | 3 | **Venue Map Link Field** | Add `mapLink` field to venue contacts, auto-populate on gig | Free | ⬜ | — | 01-25 | |
| 11 | 3 | **MusicXML Import/Export** | Import charts from iRealPro, Finale, MuseScore; export for interoperability | Free | ⬜ | 3-5d | 01-25 | |

### Chord Chart Builder Details
- **Problem**: iReal Pro is overkill; Notes apps are too crude
- **Entry Philosophy**: Click-first, minimal typing. Tap cells on grid → pick chord from palette
- **Templates**: 12-bar blues, 8-bar verse, AABA, custom
- **Features**: Section labels, repeat signs, key/tempo header, transpose function
- **Optional lyrics**: Interleave lyric lines under chord rows
- **Output**: Scrollable view, print-ready PDF, share link
- **⚠️ Wireframe first**: Create mockups before implementation

### PDF Viewer Details
- **Problem**: Export PDF → find in Downloads → open externally = too much friction
- **Solution**: Swipeable card view, render PDFs inline with `react-pdf` or PDF.js
- **⚠️ Prototype first**: Validate rendering performance on mobile Safari

---

## Gigs & Booking

| # | Pri | Feature | Description | Tier | Status | Created | Completed |
|---|-----|---------|-------------|------|--------|---------|-----------|
| 11 | 3 | **Musician Analytics (Roster Intelligence)** | Dashboard: booking frequency, reliability, sub patterns, proximity | Pro+ | ⬜ | 01-25 | |
| 12 | 3 | **Performance Promo Analytics** | Track views, geographic data, song engagement | Pro | ⬜ | 01-25 | |
| 13 | 2 | **Fan Email Capture** | Collect emails from promo pages, export to CSV | Pro | ⬜ | 01-25 | |
| 14 | 3 | **Custom Branding** | White-label promo pages, remove "Powered by OpusMode" | Pro+ | ⬜ | 01-25 | |
| 15 | 3 | **Performer Page Notifications** | Auto-notify band via SMS/email when logistics change | Pro | ⬜ | 01-25 | |
| 16 | 2 | **QR Code Generator** | Fan engagement from stage | Free | ⬜ | 01-25 | |

---

## Finance & Business

| # | Pri | Feature | Description | Tier | Status | Created | Completed |
|---|-----|---------|-------------|------|--------|---------|-----------|
| 17 | 2 | **Finance Dashboard & Reports** | Audit current implementation; add missing reports, tax exports, year-end summaries | Pro | ⬜ | 01-25 | |
| 18 | 2 | **Finance Module Risk Mitigation** | ToS disclaimer, soft deletes (30-day recovery), export reminders | — | ⬜ | 01-25 | |

---

## Venue CRM

| # | Pri | Feature | Description | Tier | Status | Created | Completed |
|---|-----|---------|-------------|------|--------|---------|-----------|
| 19 | 1 | **Contact Freshness Indicator** | Show "Last updated: X" on contact detail view | Free | ⬜ | 01-25 | |
| 20 | 2 | **Sort Contacts by Last Updated** | Add sort option to People list (lower LOE than filter) | Free | ⬜ | 01-25 | |
| 21 | 3 | **Pro Log History Export (CSV)** | Export venue interaction history | Pro | ⬜ | 01-25 | |

---

## Gear & Assets

| # | Pri | Feature | Description | Tier | Status | Created | Completed |
|---|-----|---------|-------------|------|--------|---------|-----------|
| 22 | 3 | **Gear Vault Reimagined** | Financial asset tracking: purchase dates, depreciation, insurance docs | Pro | ⬜ | 01-25 | |

---

## User Account Management

| # | Pri | Feature | Description | Tier | Status | Blocked On | Created | Completed |
|---|-----|---------|-------------|------|--------|------------|---------|-----------|
| 23 | 2 | **MFA (Multi-Factor Authentication)** | Required for sensitive account changes | — | ⬜ | Revenue/margins | 01-25 | |
| 24 | 2 | **Update Email Address** | Allow users to change account email | — | ⬜ | MFA | 01-25 | |
| 25 | 2 | **Delete Account** | GDPR-compliant self-serve deletion (30-day grace) | — | ⬜ | MFA | 01-25 | |
| 26 | 3 | **Admin Data Cleanup** | Admin panel function to delete user + all data | — | ⬜ | MFA + Admin Panel | 01-25 | |
| 27 | 2 | **CASCADE Foreign Keys** | Add `ON DELETE CASCADE` to all user-referencing tables (songs, routines, events, contacts, etc.) so user deletion auto-cleans all data | — | ⬜ | — | 01-27 | |

---

## Branding & Polish

| # | Pri | Feature | Description | Tier | Status | Created | Completed |
|---|-----|---------|-------------|------|--------|---------|-----------|
| 27 | 2 | **Custom SMTP for Auth Emails** | Send auth emails from `noreply@opusmode.net` | — | ⬜ | 01-25 | |
| 28 | 2 | **Visual Tutorial Library** | Annotated screenshots for animated tutorials | — | ⬜ | 01-25 | |
| 29 | 2 | **Upgrade Modal (Evergreen)** | Ongoing conversion optimization. Updates as features evolve. Areas: marketing images, animations, social proof, testimonials, video walkthrough. | — | ⬜ | 01-26 | |
| 30 | 1 | **Modal X Button Navigation Bug** | X button sometimes fails (can't go back). Investigate `router.back()` and navigation stack, especially after deep links or checkout return. | — | ⬜ | 01-27 | |

---

## Platform

| # | Pri | Feature | Description | Tier | Status | Created | Completed |
|---|-----|---------|-------------|------|--------|---------|-----------|
| 29 | 2 | **Native iOS/Android Apps** | App Store submission (activates "Two Islands" sync) | — | ⬜ | 01-25 | |
| 30 | 2 | **Usage Analytics (SQL Detective Work)** | Query Supabase for user behavior insights | — | ⬜ | 01-25 | |
| 31 | 2 | **Metabase BI Dashboard** | Connect Metabase to Supabase for visual dashboards | — | ⬜ | 01-25 | |

---

## ✅ Completed

- [x] **"Where to Start" Onboarding** — Dismissible banner on home page linking to new Getting Started guide, hamburger menu reorganization with Stage grouping. (2026-01-28)
- [x] **Interaction Timeline (Venue CRM)** — Log calls, emails, meetings with contacts. Full implementation in People detail view.
- [x] **Navigator In-App AI Integration** — Gemini 2.0 Flash + geocoding + markdown rendering (Build 77)
- [x] **Promotional User Tracking (`proSource`)** — Webhook sets `proSource: 'paid'` on purchases (2026-01-24)
- [x] **Admin Panel: Pro Gift Screen** — Edge Function + UI for granting/revoking Pro (Build 75)
- [x] **Pro+ Tier Implementation** — Live Mode products, webhook tier mapping, upgrade modal (Build 73)
- [x] **PWA Install Instructions** — Safari + Chrome install steps in Help/FAQ
- [x] **Upgrade Flow Playwright Test** — `upgrade-flow.spec.ts` (Build 67)
- [x] **Help/FAQ User Stories** — 11 user stories with prerequisite cross-references (Build 70)
- [x] **Lemon Squeezy Integration** — Webhook + checkout URLs (Build 43)
- [x] **Two Islands Sync Strategy** — Platform-based sync for Free tier
- [x] **Feature Discovery Carousel** — "Explore OpusMode" with persistent rotation (Build 65)
- [x] **Landing Page** — Public page with pricing + pain points
- [x] **SQLTools + Supabase Connection** — IDE database access via Session Pooler
