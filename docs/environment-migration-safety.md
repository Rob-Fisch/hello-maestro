# Environment Migration Safety Guide

> **Created:** 2026-01-22  
> **Context:** After a failed attempt to containerize AG IDE into a UTM-Linux VM, resulting in ~1.5 days of lost work and build regression.

---

## What Went Wrong (January 2026)

1. **Support files didn't transfer** — Markdown docs, conversation history, and misc files outside Git never made it to the VM
2. **Branch/build confusion** — Mixup between branched and unbranched code caused a regression by several builds
3. **No verified rollback path** — Had to recover by returning to the Mac-hosted IDE instance
4. **Conversation context was lost** — AG IDE memory and project context don't transfer between instances

---

## Pre-Migration Checklist

Before attempting any environment migration (VM, new machine, container, etc.):

### Git Hygiene
- [ ] **Commit everything** — No uncommitted changes: `git status` should be clean
- [ ] **Push to remote** — `git push origin main`
- [ ] **Tag the build** — `git tag -a v1.XX -m "Build XX - pre-migration snapshot"`
- [ ] **Push tags** — `git push origin --tags`

### Verify What's NOT in Git
- [ ] Check `.gitignore` — Are important files being excluded?
- [ ] Review `docs/` folder — Is all documentation committed?
- [ ] Check for local-only files — `.env`, IDE settings, agent artifacts
- [ ] **Conversation context** — Cannot be transferred; document key decisions in-repo

### New Environment Validation
- [ ] Clone repo fresh: `git clone <repo-url>`
- [ ] Run `npm install` / dependency installation
- [ ] Verify build: `npm run build` or equivalent
- [ ] Run tests if available
- [ ] **DO NOT start real work until the above pass**

### Rollback Plan
- [ ] Keep original environment intact until new one is verified
- [ ] Know how to roll back: `git checkout v1.XX` to tagged version
- [ ] Have a "known good" environment you can return to

---

## The UTM-Linux VM Instance

**Status:** Dormant but installed  
**Recommendation:** Keep it but remove the OpusMode project clone

### Why Remove the Project Clone:
- Prevents accidental work in the wrong environment
- Avoids future branch/build confusion
- The VM can still be useful for other experiments

### What to Keep:
- The AG IDE installation itself
- Any general-purpose tools installed
- The VM snapshot (in case you need a Linux environment later)

### To Decommission OpusMode from the VM:
```bash
# In the VM terminal
cd ~/Documents  # or wherever the project lives
rm -rf OpusMode  # removes the cloned project
```

The VM remains available for future use (testing, Linux-specific development, etc.) without the risk of OpusMode confusion.

---

## Key Principle

> **Your Mac-hosted AG IDE is the source of truth.** Treat it as production until you have a tested, verified backup strategy.

---

## Related Docs
- [BACKLOG.md](./BACKLOG.md) — Feature planning
- [pricing_tiers.md](../pricing_tiers.md) — Product strategy
