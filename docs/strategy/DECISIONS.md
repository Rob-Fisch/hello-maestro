# Technical Decisions Log

> Internal documentation of key architectural and development decisions for OpusMode.

---

## How to Use This Document

When making a significant technical decision, add an entry below with:
- **Date** — When the decision was made
- **Decision** — What was decided
- **Context** — Why this choice was made
- **Alternatives Considered** — What else was on the table
- **Outcome** — How it worked out (update later if needed)

---

## Decisions

### 2026-01-27 — Onboarding Email Flow Improvement

**Decision:** Redesign the signup email verification flow to eliminate confusing password re-entry after email confirmation.

**Context:** The current flow was confusing:
1. User enters email + password, clicks "Create Account"
2. Alert says "Check your email" (easy to miss)
3. User clicks email link → lands on "Set Password" page asking for password AGAIN
4. User confused — "Didn't I just set my password?"
5. "Skip" option makes it worse

**Root Cause:** The `onboarding-password.tsx` page was designed for invite flows (where users truly have no password), but it was being shown for ALL email confirmations including normal signups.

**New Flow:**
1. User signs up → navigates to dedicated "Check Your Inbox" page (not just an Alert)
2. User clicks email link → navigates to simple "You're All Set!" welcome page
3. Click "Enter Studio" → Home

**Files Changed:**
- `[NEW] app/modal/check-email.tsx` — "Check your inbox" waiting page
- `[NEW] app/modal/email-confirmed.tsx` — Simple "You're verified!" welcome page
- `[MODIFY] auth.tsx` — Navigate to check-email after signup
- `[MODIFY] _layout.tsx` — Route signup confirmations to email-confirmed, keep password page for invites/recovery only
- `[MODIFY] onboarding-password.tsx` — Remove "Skip" option, clarify it's for invites only

**Outcome:** Implemented 2026-01-27. Ready for testing.

---
### 2026-01-27 — Documentation Restructuring

**Decision:** Reorganize documentation from flat structure to purpose-driven subdirectories (`/docs/strategy/`, `/docs/planning/`, `/docs/reference/`). Split monolithic `pricing_tiers.md` into focused documents.

**Context:** Long conversation sessions caused context loss — important decisions (like Navigator API) were discussed in detail but forgotten by the time implementation happened. The 325-line `pricing_tiers.md` had become a catch-all for strategy, limits, ideas, and discussion notes.

**Changes Made:**
- Deleted 6 stale files (session notes, duplicates)
- Created `PRICING_TIERS.md` (clean limits), `PRODUCT_STRATEGY.md` (philosophy), `MARKETING.md` (growth), `IDEAS.md` (parking lot)
- Moved 25 SQL files to `/supabase/migrations/`
- Cleaned root directory to essentials only
- Updated `.agent/rules.md` with new doc references

**Outcome:** Documentation now organized by purpose. Agents can find information via `.agent/rules.md` references. Navigator API decision captured in this log.

---

### 2026-01-27 — Navigator Templates Use Server-Side AI Only

**Decision:** All Navigator templates (Festival Scout, Gig Hunt, etc.) use the server-side Edge Function API (`navigator-ai`) rather than client-side API calls.

**Context:** Discussed extensively early morning 2026-01-27. Key reasons:
1. **Protect proprietary prompts** — Client-side calls expose our prompt engineering
2. **Enable Query Pack monetization** — Server can track/enforce query limits
3. **Consistent billing** — All queries route through same endpoint regardless of template

**Alternatives Considered:**
- Client-side API calls with obfuscation (rejected — prompts still extractable)
- Hybrid approach (rejected — complicates billing logic)

**Outcome:** Successfully implemented. Prompts remain server-side; Query Packs work correctly.

---

### 2026-01-27 — Remove All Raw Prompts from Navigator UI

**Decision:** Remove the "View Raw Prompt" toggle from ALL Navigator templates, including free ones. Use server-side API exclusively.

**Context:** 
1. **Protect secret sauce** — Even free templates contain proprietary prompt engineering
2. **Simpler UX** — Users don't need to see/copy prompts; they click "Run Research"
3. **Consistency** — All templates work the same way

**Implementation:** Remove the collapsible raw prompt section from `coach.tsx`.

**Outcome:** Pending implementation.

### 2026-01-27 — Navigator Query Limits Strategy

**Decision:** Implement generous tiered limits to give users a "real taste" of results.

**Final Approved Limits:**
| Template Type | Free | Pro | Pro+ |
|---------------|------|-----|------|
| Free templates | 5/month | 10/month | 100/month |
| Pro templates | 5 total taste | 10/month | 100/month |

**Cost Analysis (Gemini 2.0 Flash @ ~$0.03/query):**
- Free tier at 5/month: ~$0.15/user/month — trivial at early stage
- Pro at $9.99/month for ~70 queries: ~$2.10 API cost, **$7.89 margin**
- Pro+ capped at 100/month: ~$3.00 API cost, **$16.99 margin**

**Why generous Free tier:**
1. Cost is trivial ($0.15/user/month)
2. Viral hooks (Performer Page, PDF exports) need active users to spread
3. Musicians talk — one great experience = word of mouth
4. Can dial back later if abused

**Why cap Pro+ at 100 (not "unlimited"):**
- Prevents reselling/"smart operator" abuse
- 100/month is plenty for any legitimate power user (~25/week)
- Still highly profitable even when maxed out

**Outcome:** Approved 2026-01-27. Ready to implement in Edge Function.

---

### 2026-01-27 — Contextual Upgrade Experience

**Decision:** Single Upgrade Modal (`/modal/upgrade`) with dynamic marketing copy based on trigger source, rather than separate product pages.

**Context:** 3-4 products (Pro, Pro+, Query Pack, future Set List Pack) but 10+ touch points across the app. Each trigger should show contextual "why you're here" messaging and auto-scroll to relevant section.

**Implementation:**
- `UPGRADE_TRIGGERS` config maps triggers → headlines, subtext, and anchor targets
- `?feature=navigator_limit` shows Query Pack section with "Need more AI-powered leads?" copy
- Auto-scroll lands user at relevant product section
- Maintains existing testimonial for generic visitors

**Alternatives Considered:**
- Separate `/products` page (rejected — one destination is simpler)
- Query Pack only in Navigator (rejected — misses comparison shopping opportunity)

**Outcome:** Implemented in `upgrade.tsx`. Ready for testing.

---

### 2026-01-22 — Environment Migration Safety

**Decision:** Mac-hosted AG IDE remains the source of truth. VM environments should not contain active project clones.

**Context:** Attempted to containerize development in a UTM-Linux VM. Lost ~1.5 days of work due to:
- Support files outside Git not transferring
- Branch/build confusion causing regression
- No verified rollback path
- AG conversation context not portable

**Alternatives Considered:**
- Full migration to VM (rejected — too risky without better tooling)
- Dual environments (rejected — confusion risk too high)

**Outcome:** Created `docs/environment-migration-safety.md` with pre-migration checklist. VM kept dormant but available for future experiments.

---

### 2026-01-18 — Two Islands Sync Strategy

**Decision:** Free tier syncs within platform only (Web↔Web or Native↔Native). Pro tier syncs across all platforms.

**Context:** Needed a clear value differentiation for Pro tier while maintaining local-first simplicity for Free users.

**Alternatives Considered:**
- No sync for Free tier (rejected — too limiting)
- Full sync for all (rejected — no Pro differentiation)

**Outcome:** Implemented via `platform` column in user profiles. Clean separation with clear upgrade path.

---

### 2026-01 — Payment Provider: Lemon Squeezy

**Decision:** Use Lemon Squeezy for subscription payments instead of Stripe.

**Context:** Lemon Squeezy handles merchant of record responsibilities (taxes, compliance) which simplifies solo developer operations.

**Alternatives Considered:**
- Stripe (more control, but more compliance burden)
- RevenueCat (better for native apps, but adds complexity for web)

**Outcome:** Integration complete. Webhook handles subscription lifecycle, billing portal available to users.

---

### 2025-12-26 — Unified Storage Adapter

**Decision:** Create a single `lib/storage.ts` adapter that works across web and native platforms.

**Context:** React Native and web have different storage APIs. Needed abstraction to write code once.

**Alternatives Considered:**
- Platform-specific code paths (rejected — maintenance burden)
- Third-party unified library (rejected — unnecessary dependency)

**Outcome:** Works well. Single API surface for all storage operations.

---

### 2025-12-22 — Rebrand from Hello Maestro to OpusMode

**Decision:** Rename the project from "Hello Maestro" to "OpusMode."

**Context:** "Hello Maestro" felt too casual and didn't convey the scope of the evolving product. "OpusMode" suggests creative work and a way of operating.

**Alternatives Considered:**
- GigMode (too narrow)
- MusicianOS (too grandiose)

**Outcome:** Rebrand completed. Native folders regenerated.

---

*Add new decisions at the top of the Decisions section.*
