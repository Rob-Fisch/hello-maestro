# OpusMode Feature Backlog

> Near-term actionable work. For Post-MVP ideas, see [`pricing_tiers.md`](file:///Users/robfisch/Documents/OpusMode/pricing_tiers.md).

---

## 🔥 High Priority (Store Launch)

- [x] **Upgrade Flow Playwright Test** — `upgrade-flow.spec.ts` (Build 67)
  - Verifies checkout URLs open correctly with user_id

---

## Mobile / PWA

- [ ] **PWA Install Instructions** — Add to Help/FAQ section for first-time web visitors explaining how to install the PWA.

---

## User Account Management

- [ ] **MFA (Multi-Factor Authentication)** — Implement MFA before enabling sensitive account changes. *Blocked on: revenue/margins.*
- [ ] **Update Email Address** — Allow users to change their account email (requires verification flow). *Blocked on: MFA.*
- [ ] **Delete Account** — GDPR-compliant self-serve deletion.
  - 30-day grace period before hard delete
  - Purge all user data from SQL for cost efficiency
  - *Blocked on: MFA*
- [ ] **Admin Data Cleanup** — Admin panel function to delete user + all related data.
  - Delete from all user tables (songs, events, contacts, etc.)
  - Delete from auth.users
  - *Blocked on: MFA + Admin Panel*

---

## Branding & Polish

- [ ] **Custom SMTP for Auth Emails** — Send auth emails from `noreply@opusmode.net` instead of Supabase Auth
  - Options: AWS SES, SendGrid, Mailgun, or AWS WorkMail SMTP
  - Configure in Supabase → Project Settings → Auth → SMTP Settings

---

## ✅ Completed

- [x] **Sample Data Seeding** — Manual Load/Clear controls + PDF preview/export (Build 67)
- [x] **Lemon Squeezy Integration** — Webhook + checkout URLs (Build 43)
- [x] **Two Islands Sync Strategy** — Platform-based sync for Free tier
- [x] **Feature Discovery Carousel** — "Did You Know?" with persistent rotation (Build 65)
- [x] **Landing Page** — Public page with pricing + pain points

