---
description: OpusMode workspace-specific rules and context
---

# OpusMode Project Rules

## Monetization Philosophy

Free practice features (Studio, Practice Tracking) build user base. We monetize when musicians start earning money — gigs, venues, finance. Target market: Weekend Warriors + working musicians earning from performances.

## Starting a Session

When beginning work on this project, check these documents for context:

1. **[docs/planning/BACKLOG.md](file:///Users/robfisch/Documents/OpusMode/docs/planning/BACKLOG.md)** — Prioritized near-term work
2. **[docs/strategy/DECISIONS.md](file:///Users/robfisch/Documents/OpusMode/docs/strategy/DECISIONS.md)** — Why past choices were made
3. **[docs/planning/IDEAS.md](file:///Users/robfisch/Documents/OpusMode/docs/planning/IDEAS.md)** — Parked concepts and future ideas
4. **[docs/strategy/MARKETING.md](file:///Users/robfisch/Documents/OpusMode/docs/strategy/MARKETING.md)** — Growth strategy, early adopter program
5. **[docs/strategy/PRICING_TIERS.md](file:///Users/robfisch/Documents/OpusMode/docs/strategy/PRICING_TIERS.md)** — Feature limits by tier

## Document Placement Guidance

When asked to add information to a document, evaluate if it belongs in:

- **Workspace rules** (`.agent/rules.md`) — Behavioral guidance, high-level principles
- **`docs/strategy/DECISIONS.md`** — Significant technical or product decisions
- **`docs/planning/BACKLOG.md`** — Near-term actionable work with priorities
- **`docs/planning/IDEAS.md`** — Blue sky concepts, parking lot items
- **`docs/strategy/MARKETING.md`** — Growth, pricing messaging, early adopter strategy

Suggest the best location with reasoning before adding.

## Deployment Method

**IMPORTANT**: This project uses the **Netlify CLI** for deployments, NOT manual drag-and-drop or Git-based auto-deployment.

### Standard Deployment Process

1. **Bump version** (see `/bump_version` workflow):

   ```bash
   npm run bump-build
   ```

2. **Commit changes**:

   ```bash
   git add -A && git commit -m "v1.x.x bXX: Description of changes"
   ```

3. **Push to GitHub FIRST** (source of truth):

   ```bash
   git push origin develop
   ```

4. **Deploy to Netlify**:

   ```bash
   npx netlify deploy --prod --dir=dist
   ```

   - The `--prod` flag deploys to production (live site)
   - The `--dir=dist` flag specifies the build output directory
   - You must be authenticated with Netlify CLI (one-time setup: `npx netlify login`)

> **Why GitHub first?** Git is the source of truth. Every production deployment should have a corresponding commit already backed up. If deployment fails, you can trace and rollback.

### When to Deploy

- After bumping version/build number (see `/bump_version` workflow)
- After completing and testing significant feature changes
- When deploying bug fixes to production

### Notes

- The Netlify CLI method provides immediate control over deployments
- Always verify the build locally before deploying
- The `dist` folder is gitignored and generated fresh for each deployment

---

## Feature Tiers & Monetization

**IMPORTANT**: Refer to these documents for pricing and feature information:

- [`docs/strategy/PRICING_TIERS.md`](file:///Users/robfisch/Documents/OpusMode/docs/strategy/PRICING_TIERS.md) — Feature limits by tier (Free/Pro/Pro+)
- [`docs/strategy/PRODUCT_STRATEGY.md`](file:///Users/robfisch/Documents/OpusMode/docs/strategy/PRODUCT_STRATEGY.md) — Monetization philosophy, target market
- [`docs/strategy/MARKETING.md`](file:///Users/robfisch/Documents/OpusMode/docs/strategy/MARKETING.md) — Growth strategy, early adopter program
- [`docs/strategy/DECISIONS.md`](file:///Users/robfisch/Documents/OpusMode/docs/strategy/DECISIONS.md) — Significant technical and product decisions
- [`docs/planning/BACKLOG.md`](file:///Users/robfisch/Documents/OpusMode/docs/planning/BACKLOG.md) — Near-term prioritized work items
- [`docs/planning/IDEAS.md`](file:///Users/robfisch/Documents/OpusMode/docs/planning/IDEAS.md) — Blue sky concepts and parking lot

When implementing new features or modifying existing ones, always consult these documents to ensure proper tier placement and feature gating.

---

## Documentation Updates (Site Map & Help Pages)

Not every change requires updating the Site Map or Help pages. Use these guidelines:

### When to UPDATE documentation:

- **New user-facing features** (e.g., new screens, major functionality)
- **Changes to existing workflows** that affect how users accomplish tasks
- **New navigation paths** or menu items
- **Feature removals** or deprecations
- **Changes to Free vs Pro tier access** for existing features
- **New integrations** or external service connections

**Also update [`pricing_tiers.md`](file:///Users/robfisch/Documents/OpusMode/pricing_tiers.md)** when:

- Adding new features (document tier availability and limitations)
- Changing feature tier placement (Free ↔ Pro)
- Modifying feature scope or limitations
- Moving features between MVP and Post-MVP status

### When documentation updates are NOT needed:

- Bug fixes that restore intended behavior
- UI polish or styling improvements
- Performance optimizations
- Internal refactoring
- Minor text/copy changes
- Backend improvements invisible to users

### When uncertain:

**Always ask**: "Should we add this to the help and/or site map?" for changes that fall in a gray area. It's better to confirm than to leave documentation stale or over-document minor changes.

---

## Browser Testing Credentials

**IMPORTANT**: When performing any browser automation or testing, use the **AG test accounts** instead of the user's personal credentials.

### Default Behavior

- **Always use AG test accounts** from the `/test-accounts` workflow
- Choose `antigravity-pro@opusmode.net` or `antigravity-free@opusmode.net` based on what's being tested
- If the current browser session is logged into the user's personal account, **log out first** before proceeding

### When User Credentials Might Be Needed

If testing requires the user's actual account data or permissions, **ask before using** their credentials. Otherwise, default to AG test accounts.
