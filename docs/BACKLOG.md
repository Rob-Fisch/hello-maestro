# OpusMode Feature Backlog

> Single source of truth for actionable work. For pricing strategy and feature matrix, see [`pricing_tiers.md`](file:///Users/robfisch/Documents/OpusMode/pricing_tiers.md).

---

## ⏭️ Next Session

- [x] **Pro+ Tier in Lemon Squeezy** — ✅ Completed 2026-01-24 (Build 73). Products configured in Live Mode, webhook updated, upgrade modal live.

---

## Early Adopter Feedback Program

- [x] **Promotional User Tracking (`proSource`)** — ✅ Webhook updated 2026-01-24 to set `proSource: 'paid'` on purchases. Field stored in `user_metadata` alongside `tier` and `is_premium`.
  - `'paid'` — Full-price Lemon Squeezy purchase (set automatically via webhook)
  - `'promo_lifetime'` / `'promo_trial'` / `'promo_discount'` — Set via Admin Panel or SQL
- [ ] **Admin Panel: Pro Gift Screen** — Secured admin page to grant/revoke Pro access without SQL. *LOE: ~1-2 days*
  - Search user by email
  - Select tier (Pro/Pro+) and source type (promo_lifetime, promo_trial, promo_discount)
  - Click "Grant Pro" — sets `is_premium`, `tier`, and `proSource` in one action
  - Only accessible to admin email(s) (e.g., check against allowlist)
  - Enables targeted prompts for promo users ("you owe us feedback!")
- [ ] **Staged Google Forms** — Create different feedback forms for different user checkpoints:
  - **Form A (Day 1-7)**: First impressions, intuitiveness, onboarding clarity
  - **Form B (Day 30+)**: Feature gaps, improvement ideas, NPS score
  - **Form C (Evergreen)**: General suggestions, open to all users
- [ ] **In-App Feedback Prompts** — Periodic prompts for promo users with links to Google Forms:
  - Track `lastFeedbackPromptAt` to avoid over-prompting (e.g., every 30 days)
  - Trigger contextually: after N sessions, after first Pro feature use, etc.
  - Simple banner or modal: "Help us improve OpusMode! [Give Feedback]"
- [ ] **Settings Link** — Add evergreen "Give Feedback" link in Settings for any user anytime.

---

## Feature Enhancements

- [ ] **Chord Chart Builder** — Quick cheat sheet generator for gigging musicians who don't use formal notation. *Free tier.*
  - **Problem**: iReal Pro is overkill; Notes apps are too crude. Musicians need simple chord charts with bar lines and form structure.
  - **Entry Philosophy**: Click-first, minimal typing. Tap cells on a grid → pick chord from palette.
  - **Templates**: 12-bar blues, 8-bar verse, AABA, custom. One-tap to start.
  - **Features**: Section labels (`[Verse]`, `[Chorus]`), repeat signs, key/tempo header, transpose function
  - **Optional lyrics**: Interleave lyric lines under chord rows for vocalist use
  - **Output**: Scrollable view, print-ready PDF, share link
  - **Pairs with**: Song Library (attach chart to song), Setlist (view charts in set order)
  - **⚠️ Wireframe first**: Create mockups of data entry layouts before implementation. Explore grid vs palette vs hybrid approaches.
  - **LOE**: ~5-8 days
- [ ] **Lyrics Storage / Teleprompter** — Scrollable lyrics view for vocalists. *Free tier.*
  - **Storage**: Add `lyrics` text field to Song records
  - **Display**: Dedicated "Lyric View" mode — large text, dark mode, scrollable
  - **Performance Mode**: Minimal UI, swipe through setlist order
  - **Future**: Auto-scroll at tempo, chord annotations inline `[Am] lyrics [G] here`
  - **Pairs with**: Chord Chart Builder (lyrics optional under chord lines)
  - **LOE**: ~2-3 days
- [ ] **Tempo Trainer (Smart Metronome)** — Practice tool in The Studio for progressive tempo building. *Free tier.*
  - **Parameters**: Starting tempo, target tempo, bars per rep, time signature, increase amount (+bpm), increase frequency (every Nth rep)
  - **Example**: 32 bars in 4/4 at 60bpm → +5bpm each rep until 120bpm (13 reps total)
  - **Tech**: Web Audio API (`AudioContext`), works in PWA
  - **UI**: Beat indicator, rep/bar progress, live tempo display, settings panel
  - **Future**: Decrease mode, accent patterns, audio cue on tempo change, link to Practice Artifacts, presets
  - **LOE**: ~4-6 days
- [ ] **In-App Practice Mode (PDF Viewer)** — View routines and library artifacts on screen without export. *Free tier.*
  - **Problem**: Currently must export PDF → find in Downloads → open externally. Too much friction.
  - **Solution**: Swipeable card view through routine items. Render PDFs inline, show text/narrative styled.
  - **Tech**: `react-pdf` or PDF.js for in-app PDF rendering (PWA compatible)
  - **Features**: Swipe through items, pinch-zoom PDFs, "Mark Complete" for practice tracking
  - **Reusable**: PDF viewer component usable for Song attachments, Charts, etc.
  - **⚠️ Prototype first**: Build minimal PDF viewer spike before full implementation to validate rendering performance on mobile Safari.
  - **LOE**: ~3-4 days (after prototype validation)
- [ ] **Copy Events** — Duplicate an existing event to quickly create a new one with same details (venue, personnel, set list, etc.). *Preferred over recurring events to avoid "edit one vs all" confusion. May revisit recurring events in future.*
- [ ] **Venue Assignment to Gigs** — Select a venue from Contacts (role='venue_manager') to auto-fill gig location, similar to how musicians fill personnel slots.
- [ ] **Venue Map Link Field** — Add `mapLink` field to venue contacts. When venue is attached to a gig, the map link auto-populates the gig's location link.
- [ ] **Navigator In-App AI Integration** — Run Navigator prompts directly through AI API and display results inside OpusMode. *Pro/Pro+.*
  - **Problem**: Current copy/paste workflow adds friction and users can't save results
  - **Solution**: In-app AI execution with saved results
  - **API Choice**: Gemini Flash (~$0.0013/query) or GPT-4o-mini (~$0.0025/query) — both economically viable
  - **Monthly Query Limits** (based on `proSource`):
    - Pro (Paid): 30 queries/month
    - Pro (Promo/Early Adopter): 15 queries/month
    - Pro+: 100 queries/month
  - **Saved Results**: Users can view past queries and results in a "Research History" section
  - **Cost Analysis**: Even 100 queries/month costs < $0.25. Limits are insurance against abuse, not revenue.
  - **LOE**: ~5-7 days + ongoing API costs

---

## Gigs & Booking (from pricing_tiers.md)

- [ ] **Musician Analytics (Roster Intelligence)** — Dashboard: booking frequency, reliability tracking, sub patterns, geographic proximity to venues. *(Pro+)*
- [ ] **Performance Promo Analytics** — Track views, geographic data, song engagement. *(Pro)*
- [ ] **Fan Email Capture** — Collect emails from promo pages, export to CSV. *(Pro)*
- [ ] **Custom Branding** — White-label promo pages, remove "Powered by OpusMode". *(Pro+)*
- [ ] **Performer Page Notifications** — Auto-notify band via SMS/email when logistics change. *(Pro)*
- [ ] **QR Code Generator** — Fan engagement from stage.

---

## Finance & Business

- [ ] **Gig Log (Finance Lite)** — Per-gig income tracker: Guaranteed Pay, Tips, Status (Unpaid/Paid/Deposit).
- [ ] **Finance Dashboard & Reports** — Reports, tax exports, year-end summaries. *(Pro)*
- [ ] **Finance Module Risk Mitigation** — Protect users (and OpusMode) from data loss claims:
  - ToS update: Add disclaimer that Finance is for personal record-keeping, users responsible for backups, liability limited to subscription amount.
  - In-module disclaimer: Subtle messaging (avoid "not accounting software" language) encouraging regular exports.
  - Quarterly export: Verify export modal properly handles quarterly data (Current View already supports quarters via period picker).
  - Soft deletes: 30-day recovery window for deleted transactions (add `deleted_at` column, filter from UI, allow restore).
  - Export reminders: In-app prompts at quarterly/year-end intervals nudging users to export data. *(No email infra required.)*
  - ~~*Note: `createdAt` timestamps exist for audit trail; consider adding `updatedAt` for full change tracking.*~~ ✅ Implemented 2026-01-24 — all tables now have `updated_at` with auto-update triggers.

---

## Venue CRM

- [ ] **Contact Freshness Indicator** — Show "Last updated: X" on contact detail view so users know how current the info is. Especially valuable for venue contacts. *Free tier.*
- [ ] **Stale Contact Filter** — Filter/report to find "Contacts not modified in X months" (user picks threshold). Helps users identify outdated info that needs refreshing. *Free tier.*
- [ ] **Interaction Timeline** — Log calls, emails, meetings with venue managers. *(Pro)*
- [ ] **Pro Log History Export (CSV)** — Export venue interaction history. *(Pro)*

---

## Gear & Assets

- [ ] **Gear Vault Reimagined** — Financial asset tracking: purchase dates, depreciation, insurance docs.

---

## User Account Management

- [ ] **MFA (Multi-Factor Authentication)** — Implement before enabling sensitive account changes. Required for: email change, password change, account deletion, payment method changes. Device trust (biometrics/PIN) sufficient for normal app access to preserve offline-first UX. *Blocked on: revenue/margins.*
- [ ] **Update Email Address** — Allow users to change their account email. *Blocked on: MFA.*
- [ ] **Delete Account** — GDPR-compliant self-serve deletion (30-day grace period). *Blocked on: MFA.*
- [ ] **Admin Data Cleanup** — Admin panel function to delete user + all related data. *Blocked on: MFA + Admin Panel.*

---

## Branding & Polish

- [ ] **Custom SMTP for Auth Emails** — Send auth emails from `noreply@opusmode.net` instead of Supabase Auth.
- [ ] **Visual Tutorial Library** — Collect annotated screenshots for animated instruction tutorials (PWA install, feature walkthroughs, etc.). Assets saved in artifacts folder. Can be embedded in Help/FAQ, landing page, or marketing.
  - PWA Install animation created ✓ (`pwa_install_final_*.webp`)

---

## Platform

- [ ] **Native iOS/Android Apps** — App Store submission (activates "Two Islands" sync).
- [ ] **Usage Analytics (SQL Detective Work)** — Query Supabase to understand user behavior:
  - What feature do users create first? (events vs. routines vs. contacts)
  - Which features are used most per user?
  - Pro feature adoption rates
  - Power user identification
- [ ] **Metabase BI Dashboard** — Connect Metabase (free tier) to Supabase for visual dashboards: user growth, gig trends, feature adoption, revenue metrics.

---

## Deferred

- [ ] **Sample Data Seeding** — Deferred due to RLS sync issues for Free tier.

---

## ✅ Completed

- [x] **Pro+ Tier Implementation** — Live Mode products, webhook tier mapping, upgrade modal (Build 73)
- [x] **PWA Install Instructions** — Safari + Chrome install steps in Help/FAQ
- [x] **Upgrade Flow Playwright Test** — `upgrade-flow.spec.ts` (Build 67)
- [x] **Help/FAQ User Stories** — 11 user stories with prerequisite cross-references (Build 70)
- [x] **Lemon Squeezy Integration** — Webhook + checkout URLs (Build 43)
- [x] **Two Islands Sync Strategy** — Platform-based sync for Free tier
- [x] **Feature Discovery Carousel** — "Explore OpusMode" with persistent rotation (Build 65)
- [x] **Landing Page** — Public page with pricing + pain points
- [x] **SQLTools + Supabase Connection** — IDE database access via Session Pooler
