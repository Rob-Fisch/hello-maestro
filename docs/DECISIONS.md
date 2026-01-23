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
