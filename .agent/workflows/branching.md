---
description: When to use feature branches vs. direct commits to main
---

# Branching Policy

## Direct to Main (Fixes/Tweaks)
- **Hotfixes**: Production is broken, speed matters
- **Copy changes**: Text updates, typo fixes
- **Config tweaks**: Build settings, environment variables
- **Tiny additions**: Adding a single field, or adding choices within a field (e.g., new dropdown option)

## Feature Branch Required (New Development)
- Any change that adds new files or new routes
- Work that will span multiple sessions
- Breaking changes that need isolated testing
- Experimental features not ready for production

## When In Doubt
Have a pros/cons discussion with the user before deciding:
- **Pro branch**: Safer, can pause/resume, won't leak to production
- **Con branch**: Slight overhead, may be overkill for tiny changes

**Key lesson**: Expo/Netlify builds from disk, not from git. Uncommitted files WILL be deployed if present in the working directory.
