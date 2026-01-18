---
description: OpusMode workspace-specific rules and context
---

# OpusMode Project Rules

## Deployment Method

**IMPORTANT**: This project uses the **Netlify CLI** for deployments, NOT manual drag-and-drop or Git-based auto-deployment.

### Standard Deployment Process

1. **Build the web export**:
   ```bash
   npx expo export -p web
   ```
   This generates the `dist` folder with optimized static files.

2. **Deploy to Netlify**:
   ```bash
   npx netlify deploy --prod --dir=dist
   ```
   - The `--prod` flag deploys to production (live site)
   - The `--dir=dist` flag specifies the build output directory
   - You must be authenticated with Netlify CLI (one-time setup: `npx netlify login`)

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

**IMPORTANT**: Refer to [`pricing_tiers.md`](file:///Users/robfisch/Documents/OpusMode/pricing_tiers.md) for comprehensive information about:

- Free vs Pro tier feature differentiation
- Feature scope and availability
- Monetization strategy
- Target market and positioning
- MVP vs Post-MVP features

When implementing new features or modifying existing ones, always consult this document to ensure proper tier placement and feature gating.

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
