# OpusMode Feature Backlog

> Near-term actionable work. For Post-MVP ideas, see [`pricing_tiers.md`](file:///Users/robfisch/Documents/OpusMode/pricing_tiers.md).

---

## 🔥 High Priority (Store Launch)

- [ ] **Admin Gift Pro Panel** — Grant Pro status by email, no checkout required
  - Admin-only UI in Settings (Rob's user ID only)
  - Store granted emails in `pro_grants` table
  - Check on login: if email in grants → set isPremium
  - ~1-2 hours effort

- [ ] **Upgrade Flow Playwright Test** — `upgrade-flow.spec.ts`
  - Verify checkout URLs open correctly with user_id

- [ ] **Sample Data Seeding** — Seed new accounts with example data to showcase modules
  - Badge entries as "Sample" so users know it's demo data
  - Cover core modules: 1 sample gig + linked set list + contacts + transactions
  - Include easy cleanup option (one-tap "Clear Sample Data")
  - Details TBD during implementation

---

## Mobile / PWA

- [ ] **PWA Install Instructions** — Add a "How to Install" screen or Help section for first-time web visitors explaining how to install the PWA.

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

## ✅ Completed

- [x] **Lemon Squeezy Integration** — Webhook + checkout URLs (Build 43)
- [x] **Two Islands Sync Strategy** — Platform-based sync for Free tier
- [x] **Feature Discovery Carousel** — "Did You Know?" with persistent rotation (Build 65)
- [x] **Landing Page** — Public page with pricing + pain points
