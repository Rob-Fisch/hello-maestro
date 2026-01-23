# OpusMode Feature Backlog

> Single source of truth for actionable work. For pricing strategy and feature matrix, see [`pricing_tiers.md`](file:///Users/robfisch/Documents/OpusMode/pricing_tiers.md).

---

## ⏭️ Next Session

- [ ] **PWA Install Instructions** — Add to Help/FAQ section for first-time web visitors explaining how to install the PWA.

---

## Early Adopter Feedback Program

- [ ] **Promotional User Tracking** — Add `proSource` field to `profiles` table to distinguish how users became Pro:
  - `'paid'` — Full-price Lemon Squeezy purchase (set via webhook)
  - `'promo_lifetime'` / `'promo_trial'` / `'promo_discount'` — Set via admin action or coupon flow
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

- [ ] **Copy Events** — Duplicate an existing event to quickly create a new one with same details (venue, personnel, set list, etc.). *Preferred over recurring events to avoid "edit one vs all" confusion. May revisit recurring events in future.*
- [ ] **Venue Assignment to Gigs** — Select a venue from Contacts (role='venue_manager') to auto-fill gig location, similar to how musicians fill personnel slots.
- [ ] **Venue Map Link Field** — Add `mapLink` field to venue contacts. When venue is attached to a gig, the map link auto-populates the gig's location link.
- [ ] **Navigator API Hybrid** — Free tier: copy/paste prompts (visible, demo value). Pro tier: in-app API results (prompts hidden, seamless UX). Protects "secret sauce" while adding real value for paying subscribers. Use GPT-4o-mini or Gemini Flash (~$0.002/query).

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
  - *Note: `createdAt` timestamps exist for audit trail; consider adding `updatedAt` for full change tracking.*

---

## Venue CRM

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

- [x] **Upgrade Flow Playwright Test** — `upgrade-flow.spec.ts` (Build 67)
- [x] **Help/FAQ User Stories** — 11 user stories with prerequisite cross-references (Build 70)
- [x] **Lemon Squeezy Integration** — Webhook + checkout URLs (Build 43)
- [x] **Two Islands Sync Strategy** — Platform-based sync for Free tier
- [x] **Feature Discovery Carousel** — "Explore OpusMode" with persistent rotation (Build 65)
- [x] **Landing Page** — Public page with pricing + pain points
- [x] **SQLTools + Supabase Connection** — IDE database access via Session Pooler
