# OpusMode Ideas & Parking Lot

> Blue sky concepts not ready for the backlog. For actionable work, see [BACKLOG.md](file:///Users/robfisch/Documents/OpusMode/docs/planning/BACKLOG.md).

---

## Future Feature Ideas

### Venue Persistence (CRM History Protection)

**Problem**: Unlike other contacts, **venues outlive the people who work there**. Hiring managers change, but the venue (and your relationship history with it) should persist.

**Risk**: If a user deletes a contact (e.g., old booking manager), they might accidentally lose all the CRM interaction history with that venue.

**Concept**: Make Venue a first-class entity, separate from Person. People link *to* venues. When the hiring manager changes, you update the person link — the venue's CRM history stays intact.

**Data Model Implication**:
- `Venue` entity (name, address, vibe, booking patterns)
- `Person` links to `Venue` via relationship
- CRM timeline lives on `Venue`, not `Person`

**Status**: Parking lot — important to remember, not immediate work.

---

### Booking Manager Tier (Multi-Act Concurrent Booking)

**Concept**: New tier for booking agents/managers who need to book multiple acts with overlapping time slots.

**Challenges**:
- Current Terms of Service 4.3 enforces one account per user
- One email = one account in auth systems
- May need workspace/organization model

**Status**: Parked — requires significant architectural changes.

---

### Musician Analytics (Roster Intelligence)

**Concept**: Dashboard showing booking frequency, reliability, sub patterns, proximity for musicians you work with.

**Why Parked**: Aspirational idea from early development. Given other backlog priorities, unlikely to be built. Would require ML/analytics layer on top of existing data.

---

### Custom Branding (White-Label Promos)

**Concept**: Remove "Powered by OpusMode" from Performance Promo pages. Add custom logo and colors.

**Tier**: Pro+ only
**Status**: Post-MVP, pending marketing strategy decisions.

---

### Blog/Social Media Content Generator

**Concept**: AI-powered blog and social post generator. Answer a few questions about your gig and get compelling content with a hook beyond just "time, place, band."

**Status**: Future Navigator/Promotion feature.

---

## Limit-Based Pack Ideas

> See [MARKETING.md](file:///Users/robfisch/Documents/OpusMode/docs/strategy/MARKETING.md) for the "10-Pack Bridge Strategy"

- **Set List Pack** — When hitting 5 master set list limit
- **Song Library Pack** — When hitting 50 song limit
- **Storage Pack** — When hitting 100MB limit
- **Promo Page Pack** — When hitting free promo page limit (TBD)

---

## Discussion Items (Unresolved)

### Performance Promo Limits for Free Users
> From pricing_tiers.md: "Can we place limits on the number of Promo pages? I would think 30 free ones, then let's hit them with upgrading or buying '10 packs' for $10 like we did for Navigator queries"

**Status**: Needs decision.

---

### Community Support Option
> "We don't have this. Do we even want it? If so how, definitely not FB."

**Status**: Needs decision on whether/how to offer Free tier support.

---

### Automated Performer Page Notifications
> "We already have a way for users to send targeted messages selectively to one or more band members in the Gig Event. It's probably a bad idea to automate this."

**Status**: Likely killed — manual messaging preferred.

---

*Add new ideas at the top of the relevant section.*
