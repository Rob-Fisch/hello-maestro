# OpusMode Pricing Tiers & Features Plan

> [!NOTE]
> Living document. Edit in Typora.
> **Format**: Separate tables per module. Row numbers reset for each table.
> 
> **Pricing (Launch)**: 
> - **Free**: $0
> - **Pro**: $9.99/month or $99/year (Lemon Squeezy approved)
> - **Pro+ / Team**: $19.99/month or $199/year (pending - will add to Lemon Squeezy after approval)
> 
> **Monetization Philosophy**: Practice room features (Studio, Practice Tracking) are generous/free to build user base. We monetize when musicians start earning money - gigs, venues, finance tracking, set list management for paid performances. Target market: Weekend Warriors + Pro musicians (anyone earning from gigs).
> 
> **Pro+ Tier Note**: Pro+ exists primarily to enforce reasonable storage limits and prevent abuse (e.g., users uploading entire college PDF libraries). Need to qualify "unlimited" claims on website.
> 
> **Roster Naming**: "Roster" is a placeholder term. Need better generic label that works for bands, chamber groups, orchestras, freelancers, subs, etc.

### 1. Standard Events (Non-Gigs)
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Create Events** | Unlimited | Unlimited | Unlimited | Plan your schedule with robust event types for rehearsals, lessons, and more. | Rehearsals, lessons, etc. | | `events` table, `type` field |
| 2 | **Recurring Events** | Yes | Yes | Yes | Easily set sophisticated repeat patterns for weekly rehearsals or semester lessons. | Repeat patterns. | Simplified - no tier difference needed | `events.schedule` JSONB |

### 2. Gigs & Booking
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Create Gigs** | Unlimited | Unlimited | Unlimited | Manage every detail of your performance life in one place. | Performance events. | | `events` table, `type='gig'` |
| 2 | **Gig Roster (Fill Seats)** | Yes | Yes | Yes | Build your lineup for each gig - create seats for each role (drummer, bassist, etc.), then fill them with musicians from your contacts. Track availability, send invites, and manage confirmations. | **KILLER FEATURE** - Two-step workflow: 1) Create seats/roles for the gig, 2) Fill seats with specific people. Track who's confirmed/pending/declined | One of the most compelling features - helps freelancers and bandleaders manage their roster for each gig. "Fill Seats" emphasizes the role-first workflow | `events.slots` JSONB array, `people` table integration |
| 3 | **Musician Analytics (Roster Intelligence)** | - | - | Yes (Pro) | **(Post-MVP)** Unlock powerful insights from your gig history - see which musicians you work with most, track reliability (on-time vs late arrivals), identify your go-to subs, analyze travel distance to venues, and more. Make smarter booking decisions based on real data. | **KILLER POST-MVP FEATURE** - Analytics dashboard showing: frequency of bookings per musician, punctuality tracking, sub usage patterns, geographic proximity to venues, availability trends, etc. | Game-changer for bandleaders and contractors. Turns gig data into actionable intelligence. Could include "Musician Scorecards" with reliability ratings, preferred roles, etc. | Aggregate data from `events.slots` history, `people` table, venue locations. ML/analytics layer on top of existing data |
| 4 | **Stage Plot (Public Event Sharing)** | Yes | Yes | Yes | Share a beautiful public event page with fans - include setlists, bio, tip jar, and mailing list signup. | Public event pages at `/fan/{eventId}`. | Available to all tiers. Future: QR codes. | `events.is_public_stage_plot`, `events.public_description`, `events.show_setlist`, `events.social_link`, `profiles` table |
| 5 | **QR Code Generator (Fan Engagement)** | - | - | - | **(Coming Soon)** Build your fanbase effortlessly from the stage. | **POST MVP** | | Future enhancement to Stage Plot |
| 6 | **Blog/Social Media Content Generator** | - | - | - | **(Future)** AI-powered blog and social post generator. Answer a few questions about your gig and get compelling content with a hook beyond just "time, place, band." | **POST MVP** | Help musicians promote gigs with engaging stories | Future Navigator/Promotion feature |

### 3. Song Library & Set Lists
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Song Library** | Limit: 50 | Unlimited* | Unlimited* | Build your complete repertoire database with charts, lyrics, and notes for every song you know. | Master song database | *Qualify "unlimited" on website | `songs` table |
| 2 | **Master Set Lists (Templates)** | Limit: 5 | Unlimited* | Unlimited* | Create reusable set list templates like "Wedding Gig," "Jazz Standards," or "Dance Party" from your song library. | Reusable templates (not tied to specific gigs) | *Qualify "unlimited". These are the templates you fork for specific gigs. | `routines` table where `eventId` is null |
| 3 | **File Storage** | ~100MB | ~5GB | ~20GB | Keep all your PDFs, charts, and diagrams attached directly to songs. | PDFs/Images. | Pro+ prevents library dumping | Supabase Storage, `blocks.media_uri` |
| 4 | **Gig-Specific Set Lists (Forking)** | No | Unlimited | Unlimited | Import a Master Set List and customize it for tonight's gig - add/remove songs without affecting your template. | Fork master lists for specific events | Free tier can't fork - must use master lists as-is or create from scratch each time | `routines` table where `eventId` is set, `originalSetListId` tracks the source |

> [!NOTE]
> **How Set Lists Work**: 
> 1. **Song Library** - Your complete repertoire (e.g., 200 songs you know)
> 2. **Master Set Lists** - Reusable templates you create from your library (e.g., "Wedding List", "Dance Gig", "Jazz Standards")
> 3. **Gig-Specific Set Lists** - For each gig, import a Master Set List and customize it (fork it) for that specific event. A wedding might need 3 hours, a club gig might be 90 minutes - same template, different customization.

### 4. Sync & Data
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Cloud Backup (Push)** | Yes | Yes | Yes | "Puddle Proof" your career. Never lose data if you break your phone. | "Puddle Proofing". | | Supabase sync |
| 2 | **Active Sync (Pull)** | Manual Only | Realtime | Realtime | Seamlessly move between iPhone, iPad, and Desktop. | Pro stays in sync. | | Realtime subscriptions |
| 3 | **Cross-Platform Sync** | No ("Two Islands") | Yes | Yes | Start working on your commute (Mobile), finish at your desk (Web). | Free: Devices are separate islands. Can push but not pull. | | Web + Mobile sync |

### 5. The Studio (Practice & Routines)
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Practice Artifacts (Building Blocks)** | Limit: 50 | Unlimited* | Unlimited* | Create individual practice items: excerpts, exercises, full songs, or narrative instructions (e.g., "C scale, 2 octaves, repeat twice"). | Level 1: Individual practice items | *Qualify "unlimited". Combined with 100MB storage limit for Free tier, this prevents abuse while remaining generous. | `blocks` table |
| 2 | **Collections (Practice Routines)** | Limit: 3 | Unlimited* | Unlimited* | Assemble multiple artifacts into a complete practice routine. Print as a single PDF instead of flipping through multiple books. | Level 2: Assembled routines | *Qualify "unlimited". "Collections" is placeholder term - need better name | `routines` table |
| 3 | **Public Collections (Teacher Sharing)** | Access All | Access All | Access All | Teachers can share practice routines with students via time-limited public links. Students must sign up to view. | Growth hook: requires login | Time-limited links to prevent abuse. Teachers share with students. | `routines.is_public`, time-limited share links |
| 4 | **Practice Tracking & Session Logging** | Yes | Yes | Yes | Check off completed items during practice. Log sessions with ratings and notes to track your progress and stay motivated. | Session logging with progress tracking | Practice room features are free - we monetize when musicians start earning (gigs, venues, finance) | `user_progress` table |
| 5 | **History Log** | Limit: 3 Months | Unlimited | Unlimited | Review your lifetime of practice sessions with notes. Free users see last 90 days only. | Free: view last 90 days only. | Keeps you motivated and on track | `user_progress` table with date filtering |

> [!NOTE]
> **How The Studio Works**: 
> 1. **Practice Artifacts** - Individual building blocks: scales, excerpts, exercises, songs, or narrative instructions (e.g., "Play C major scale, 2 octaves, twice. Increase tempo as you build strength")
> 2. **Collections (Routines)** - Assemble multiple artifacts into a complete practice routine. Print as one PDF instead of juggling multiple books.
> 3. **Practice Sessions** - As you practice, check off completed items. Add notes at the end of each session to track progress and stay motivated.
> 4. **Teacher Sharing** - Teachers can create Collections and share them publicly via time-limited links. Students must sign up to access (growth hook).

### 6. Team & Contacts
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Contact Management** | Basic (Name/Role) | Advanced | Advanced | Keep a Rolodex of every sub, sound guy, and bandmate. | Full contact info, subs, notes. | "Roster" is placeholder - need better term | `people` table |

### 7. The Navigator
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Gig Hunt (Student/Community)** | Yes (Demo) | Yes | Yes | Find community venues, libraries, coffee shops, and open mics perfect for students and emerging artists. | Free mission as demo | Shows value without giving away premium missions | AI-powered search, copy/paste prompts |
| 2 | **Gig Hunt (Professional)** | No (Locked) | Yes | Yes | Instantly find venues booking your genre in any city - listening rooms, clubs, and musician-centric spots. | Find venues. | Pro-only | AI-powered search |
| 3 | **Teaching** | No (Locked) | Yes | Yes | Discover music schools and stores hiring teachers near you. | Find schools/stores. | Pro-only | AI-powered search |
| 4 | **Tour Stop** | No (Locked) | Yes | Yes | Fill awkward gaps in your tour schedule with smart routing suggestions. | Fill schedule gaps. | Pro-only | AI-powered routing |
| 5 | **Promotion** | No (Locked) | Yes | Yes | Build a hit-list of local radio stations and press outlets. | Find press/radio. | Pro-only | AI-powered search |
| 6 | **Pro Shops** | No (Locked) | Yes | Yes | Locate the best luthiers and repair techs in town. | Find repair techs. | Pro-only | AI-powered search |

> [!NOTE]
> **Navigator Strategy**: The "Student" mission is free for all users as a demo to show the power of The Navigator. Once users see the value, they'll upgrade for the professional missions. No API integration for MVP - users copy/paste the generated prompts into ChatGPT/Claude.

### 8. Venue CRM
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Venue Database** | Limit: 5 | Unlimited* | Unlimited* | Build your own black book of venues and contacts. | Address, Booking Contacts. | *Qualify "unlimited" | `people` table with role='venue_manager' |
| 2 | **Interaction Timeline** | No | Yes | Yes | Never drop the ball - log every call, email, meeting, and gig with venue managers. Manual timeline keeps your relationship history in one place. | Manual logging: calls, emails, meetings, gigs, rehearsals, jam sessions | Should integrate with Schedule - click venue in gig to navigate to CRM timeline | `people` table with interaction history (JSONB field) |

### 9. Finance Module
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Per-Gig Finance Tracking** | Yes | Yes | Yes | Track income, expenses, and musician splits for each gig. We keep the totals for you. | Per-gig tracking in Finance tab | Free users can enter data, we track totals. Messaging: "Start tracking now - when you need tax reports, upgrade to Pro" | `event_finance`, `expenses`, `transactions` tables |
| 2 | **Finance Dashboard & Reports** | No | Yes | Yes | See your complete financial picture with reports, tax exports, and year-end summaries. | Reports, tax exports, analytics | Pro unlocks the Finance module with reports across all gigs | Export functionality, dashboard views |

### 10. Gear & Equipment
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Gear Inventory** | - | - | - | **(Future)** Track your instruments, amps, and pedals with photos and serial numbers. | **NOT FOR MVP** | Tabled for future backlog | `gear_assets` table exists |

### 11. Other / Custom
| # | Feature | Free Tier | Pro Tier | Pro+ / Team | Website Description | Agent Notes | Rob's Notes | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Support** | Community | Email | Priority | | | | |
| 2 | **Branding (Report Logo)** | No | Yes | Yes | Add your logo to every stage plot, quote, and invoice. | | | `profiles.avatar_url` |

---

## Apple App Store Launch Notes

> [!IMPORTANT]
> **Two Islands Sync Strategy** - Implemented and deployed (Jan 2026)
> 
> Free users can only sync within their platform (Web OR Native App). Pro users get full cross-platform sync. This creates a strong upgrade incentive for users who want to use both laptop (web) and iPhone (native app).

### Implementation Status

**✅ Completed (Jan 16, 2026)**
- Database migration: Added `platform` column to all user data tables
- TypeScript types: Added `platform: 'web' | 'native'` field to all data models
- Auto-tagging: All data is automatically tagged with platform on creation
- Sync filtering: Free users only pull data from their current platform
- Pro users: Get full cross-platform sync automatically

**📋 Pending App Store Launch**
- Merge prompt: When Pro users upgrade, show prompt to merge Web + Native data
- Testing: Full Two Islands testing requires App Store build
- Documentation: Update help screen with App Store-specific guidance

### How Two Islands Works

**Platform Detection:**
- `web` = Any browser (Safari, Chrome, Firefox, etc.) on any device
- `native` = iOS App Store / Android Play Store apps

**Free Tier Behavior:**
- User creates event on Web → tagged as `platform: 'web'`
- User opens Native app → only sees `platform: 'native'` data
- **Result**: Data is isolated by platform (Two Islands)

**Pro Tier Behavior:**
- User creates event on Web → tagged as `platform: 'web'`
- User opens Native app → sees ALL data (both `web` and `native`)
- **Result**: Full cross-platform sync

**Intentional Loophole:**
- PWA on iPhone = `platform: 'web'` (same as browser)
- Free users who use PWA on all devices get cross-browser sync
- **By design**: If they're savvy enough to figure this out, they've earned it!

### Upgrade Flow (When App Store Launches)

**Scenario**: Free user has data on both Web and Native, then upgrades to Pro

1. **Detection**: Check if user has data on both platforms
2. **Prompt**: Show merge dialog with counts:
   ```
   Merge Your Data?
   
   Web: 15 events, 42 songs
   Native App: 12 events, 38 songs
   
   ⚠️ Note: If you entered the same data on both 
   platforms, you'll see duplicates after merging.
   
   [Keep Web Only] [Keep Native Only] [Merge All]
   ```
3. **Action**: User chooses to merge or keep one platform
4. **Result**: Pro user gets unified data or continues with single platform

### Testing Plan (Post App Store Launch)

**Test 1: Free User - Single Platform**
- Sign in as Free user on Web
- Create event "Test - Web"
- Open Native app
- **Expected**: Event does NOT appear ✅

**Test 2: Pro User - Cross-Platform**
- Sign in as Pro user on Web
- Create event "Test - Pro"
- Open Native app
- **Expected**: Event appears automatically ✅

**Test 3: Upgrade Flow**
- Free user with data on both platforms
- Upgrade to Pro
- **Expected**: Merge prompt appears with counts ✅

### Technical Details

**Database Schema:**
```sql
-- All user data tables have:
platform TEXT DEFAULT 'web' CHECK (platform IN ('web', 'native'))
```

**Code Files:**
- `lib/platform.ts` - Platform detection helpers
- `lib/sync.ts` - Auto-tagging and filtering logic
- `lib/crossPlatformHelpers.ts` - Merge prompt and detection
- `store/types.ts` - TypeScript type definitions
- `migration_add_platform_column.sql` - Database migration

**Key Functions:**
- `getCurrentPlatform()` - Returns 'web' or 'native'
- `pullFromCloud(isPremium)` - Filters by platform for Free users
- `detectCrossPlatformData(userId)` - Checks for data on other platform
- `showCrossPlatformMergePrompt()` - Shows upgrade merge dialog

### Marketing Messaging

**Free Tier:**
"Choose your platform - Web or Native App. Your data stays on your chosen platform."

**Pro Tier:**
"Seamless sync across Web and Native Apps. Work anywhere, your data follows you."

**Upgrade Prompt (in-app):**
"Unlock Cross-Platform Sync - Use both laptop and phone? Upgrade to Pro to access your data everywhere!"

### Future Considerations

- **Android Play Store**: Same logic applies (native vs web)
- **Tablet apps**: Treated as native platform
- **Desktop apps**: If we build Electron app, treated as native
- **Data portability**: All data is backed up regardless of tier (Puddle Proof)

---

## Post-MVP Backlog

> Features intentionally deferred to streamline MVP. Revisit after launch.

### Venue Management
- [ ] **Pro Log History Export (CSV)**: Export interaction history with venues to CSV. *(Pro tier)*
    - Useful for managers who need external reporting or analysis.

### Finance & Business
- [ ] **Gig Log (Finance Lite)**: Per-gig income tracker with payment status field.
    - Fields: `Guaranteed Pay`, `Tips`, `Status` (Unpaid, Paid, Deposit Received)
    - *Note: Core finance module was removed to simplify gig workflow. May add back.*

### Gear & Assets
- [ ] **Gear Vault Reimagined**: Pivot from inventory to financial asset tracking.
    - Track purchase dates, prices, depreciation, insurance documentation.
    - Goal: Help musicians at tax time and with insurance claims.
