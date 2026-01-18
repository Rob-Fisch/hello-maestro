# OpusMode Documentation Inventory

**Generated:** January 17, 2026  
**Repository:** `/Users/robfisch/Documents/OpusMode`

---

## 📋 Executive Summary

This repository contains **13 primary markdown documentation files** in the root directory, **9 additional documentation files** in the `/docs` folder, and **2 workflow/configuration files** in the `.agent` folder. Additionally, there are **22 SQL migration files** and **11 configuration JSON files** that serve as technical documentation.

---

## 📚 Primary Documentation (Root Directory)

| File | Category | Summary | Last Updated | Size |
|------|----------|---------|--------------|------|
| [README.md](file:///Users/robfisch/Documents/OpusMode/README.md) | **Getting Started** | Standard Expo boilerplate README with basic setup instructions. Contains generic Expo project information - likely needs updating to reflect OpusMode specifics. | Unknown | 1.7 KB |
| [PROJECT_JOURNEY.md](file:///Users/robfisch/Documents/OpusMode/PROJECT_JOURNEY.md) | **Project Overview** | Living case study documenting the "Antigravity Journey" - how OpusMode is being built by a single founder (Rob) paired with an AI agent. Chronicles milestones, technical achievements, and the tech stack. Serves as a showcase for agentic AI development. | Unknown | 3.4 KB |
| [DEVELOPMENT_STRATEGY.md](file:///Users/robfisch/Documents/OpusMode/DEVELOPMENT_STRATEGY.md) | **Development Process** | Comprehensive guide to the two-tier development strategy (Dev/Production), infrastructure setup (GitHub, Supabase, Netlify, Expo), deployment workflow, and disaster recovery procedures. Essential reading for understanding the deployment pipeline. | Unknown | 3.9 KB |
| [NEXT_STEPS_LAUNCH_PLAN.md](file:///Users/robfisch/Documents/OpusMode/NEXT_STEPS_LAUNCH_PLAN.md) | **Launch Planning** | Four-phase action plan covering: QA & validation, content & marketing assets, business & legal infrastructure, and final deployment. Includes TestFlight setup, App Store requirements, and payment infrastructure strategy. | Unknown | 2.5 KB |
| [PRODUCT_BACKLOG.md](file:///Users/robfisch/Documents/OpusMode/PRODUCT_BACKLOG.md) | **Product Planning** | Feature backlog organized by priority. Includes UX/UI polish items, venue management features, business & growth features (Pro+), asset tracking, and the ambitious "Band Website Builder" concept for a potential Pro++ tier. | Unknown | 3.1 KB |
| [pricing_tiers.md](file:///Users/robfisch/Documents/OpusMode/pricing_tiers.md) | **Product Strategy** | **CRITICAL DOCUMENT** - Comprehensive pricing and feature matrix covering all 11 feature modules. Defines Free vs Pro vs Pro+ tiers, monetization philosophy, storage limits, and the "Two Islands" sync strategy. Includes detailed implementation notes for App Store launch. | Jan 2026 | 20.9 KB |
| [PWA_DEPLOYMENT_PLAN.md](file:///Users/robfisch/Documents/OpusMode/PWA_DEPLOYMENT_PLAN.md) | **Deployment Guide** | Step-by-step guide for deploying the PWA to Netlify, including build process, domain configuration, SSL setup, and continuous deployment strategy. | Unknown | 2.8 KB |
| [CROSS_PLATFORM_STRATEGY.md](file:///Users/robfisch/Documents/OpusMode/CROSS_PLATFORM_STRATEGY.md) | **Technical Strategy** | Feature parity matrix comparing Native vs PWA implementations. Documents platform-specific limitations and proposed alternatives for messaging, calendar sync, PDF export, and other native features. Includes web-specific layout and asset loading requirements. | Unknown | 3.6 KB |
| [EXTERNAL_SERVICES_REGISTRY.md](file:///Users/robfisch/Documents/OpusMode/EXTERNAL_SERVICES_REGISTRY.md) | **Infrastructure** | Complete registry of all external services and accounts: Netlify (hosting), AWS Route 53 (DNS), Supabase (backend), Expo/EAS (mobile builds), and GitHub (source control). Includes service map diagram. | Unknown | 2.7 KB |
| [TODO.md](file:///Users/robfisch/Documents/OpusMode/TODO.md) | **Session Notes** | Handover notes from Dec 31, 2025 session. Documents accomplished items (simulator stability, cloud sync fixes), next steps (video tutorials, branding), and critical cross-device sync issue requiring real-time subscriptions. | Dec 31, 2025 | 1.9 KB |
| [PRIVACY_POLICY.md](file:///Users/robfisch/Documents/OpusMode/PRIVACY_POLICY.md) | **Legal** | Comprehensive privacy policy covering data collection, storage, sharing, user rights, security measures, and compliance (CCPA). Includes details on the "Two Islands" platform-based data isolation for Free tier vs cross-platform sync for Pro tier. **App Store requirement.** | Jan 17, 2026 | 8.6 KB |
| [TERMS_OF_SERVICE.md](file:///Users/robfisch/Documents/OpusMode/TERMS_OF_SERVICE.md) | **Legal** | Complete terms of service covering account management, subscription plans, user content, prohibited conduct, public sharing features, AI-generated content disclaimers, liability limitations, and dispute resolution. **App Store requirement.** | Jan 17, 2026 | 14.0 KB |
| [blackboard.md](file:///Users/robfisch/Documents/OpusMode/blackboard.md) | **Reference/Scratch** | Contains Google Gemini-generated results for local music venue research in the 12165 area (West Lebanon/Stephentown). Includes tables of community hubs, coffee shops, open mics, and busking locations. Appears to be reference material or test content. | Unknown | 6.1 KB |
| [AGENT_SIGNAL.md](file:///Users/robfisch/Documents/OpusMode/AGENT_SIGNAL.md) | **Development Notes** | Brief signal file noting PWA is running and addressing potential agent "stuck" state. Dated Dec 23, 2025. | Dec 23, 2025 | 224 B |

---

## 📁 Extended Documentation (`/docs` folder)

| File | Category | Summary | Size |
|------|----------|---------|------|
| [ARCHITECTURE_COMPASS_V2.md](file:///Users/robfisch/Documents/OpusMode/docs/ARCHITECTURE_COMPASS_V2.md) | **Architecture** | Defines the unified Journey architecture merging "Compass" and "Routines" modules. Documents three node types: Practice (Routine), Task (Action), and Resource (Material). Includes affiliate link strategy and data model updates. | 2.3 KB |
| [ARCHITECTURE_V3_CONSOLIDATION.md](file:///Users/robfisch/Documents/OpusMode/docs/ARCHITECTURE_V3_CONSOLIDATION.md) | **Architecture** | (Not viewed - likely continuation of architecture documentation) | Unknown |
| [BACKLOG.md](file:///Users/robfisch/Documents/OpusMode/docs/BACKLOG.md) | **Feature Planning** | Feature backlog covering user account management (email updates, password reset, account deletion), onboarding education for "Two Islands" sync, PWA install instructions, and analytics features. | 1.2 KB |
| [CRM_SCOUT_PLAN.md](file:///Users/robfisch/Documents/OpusMode/docs/CRM_SCOUT_PLAN.md) | **Feature Planning** | (Not viewed - likely covers CRM and Scout AI feature planning) | Unknown |
| [DEPLOYMENT_CHECKLIST.md](file:///Users/robfisch/Documents/OpusMode/docs/DEPLOYMENT_CHECKLIST.md) | **Deployment** | Deployment checklist with build, asset verification, config, deploy, and domain steps. Includes health status table showing PWA live on Netlify with all major issues resolved as of Dec 26, 2025. | 1.0 KB |
| [HELP_CENTER_DRAFTS.md](file:///Users/robfisch/Documents/OpusMode/docs/HELP_CENTER_DRAFTS.md) | **User Documentation** | (Not viewed - likely contains draft help center content for users) | Unknown |
| [NEXT_SESSION_PLAN.md](file:///Users/robfisch/Documents/OpusMode/docs/NEXT_SESSION_PLAN.md) | **Development Planning** | (Not viewed - likely contains planning notes for upcoming development sessions) | Unknown |
| [SUBSCRIPTION_TIERS.md](file:///Users/robfisch/Documents/OpusMode/docs/SUBSCRIPTION_TIERS.md) | **Product Strategy** | Earlier/alternative version of pricing strategy. Defines Free ("Puddle Proof"), Pro ("Everything Everywhere" at ~$19.99/year), and Pro+ tiers. Includes feature gate development status. **Note:** May be superseded by root-level `pricing_tiers.md`. | 2.5 KB |
| [USER_GUIDE_FOR_AGENTS.md](file:///Users/robfisch/Documents/OpusMode/docs/USER_GUIDE_FOR_AGENTS.md) | **Agent Instructions** | Critical guide for AI agents working on this project. Documents the "I Wonder" protocol (consultation vs implementation), technical preferences, deployment quirks, and sync behavior. Essential reading for understanding Rob's working style. | 2.1 KB |

---

## ⚙️ Configuration & Workflow Files

| File | Category | Summary | Size |
|------|----------|---------|------|
| [.agent/rules.md](file:///Users/robfisch/Documents/OpusMode/.agent/rules.md) | **Workspace Rules** | Workspace-specific rules covering: Netlify CLI deployment method (not drag-and-drop), feature tier guidelines referencing `pricing_tiers.md`, and documentation update policies. **Critical for deployment workflow.** | 2.9 KB |
| [.agent/workflows/bump_version.md](file:///Users/robfisch/Documents/OpusMode/.agent/workflows/bump_version.md) | **Workflow** | (Not viewed - workflow for bumping application version and build number) | Unknown |

---

## 🗄️ Database Documentation (SQL Files)

**22 SQL migration files** documenting database schema evolution:

### Core Schema
- `supabase_schema.sql` - Base database schema (6.2 KB)
- `supabase_migration_soft_deletes.sql` - Soft delete implementation (1.3 KB)

### Feature Migrations
- `migration_add_platform_column.sql` - Two Islands sync strategy implementation (2.9 KB)
- `migration_create_profiles_table.sql` - User profiles (2.5 KB)
- `migration_setlist_foundation.sql` - Song library & setlists (1.7 KB)
- `migration_stage_plot_columns.sql` - Performance promotion features (2.3 KB)
- `migration_business_features.sql` - Business/finance features (3.1 KB)
- `migration_finance_sync.sql` - Finance tracking (1.3 KB)
- `migration_transactions.sql` - Transaction logging (887 B)
- `migration_venue_manager.sql` - Venue CRM (265 B)
- `migration_performer_page.sql` - Performer logistics sharing (2.1 KB)
- `migration_teacher_strategy.sql` - Teacher/student features (728 B)

### Access & Security
- `migration_fix_rls_policies.sql` - Row-level security fixes (1.2 KB)
- `migration_fix_public_access.sql` - Public access fixes (1.1 KB)
- `migration_public_events.sql` - Public event sharing (415 B)
- `migration_public_invites.sql` - Public invite system (1.6 KB)
- `migration_respond_invite.sql` - Invite response handling (1.5 KB)
- `migration_secure_sharing.sql` - Secure sharing features (261 B)

### Data Management
- `migration_add_storage_usage.sql` - Storage tracking (752 B)
- `migration_add_manufacture_year.sql` - Gear tracking enhancement (365 B)
- `migration_contacts_address_fields.sql` - Contact address fields (751 B)

### Debug
- `debug_rls_policies.sql` - RLS policy debugging (235 B)

---

## 🔧 Configuration Files (Non-Documentation)

| File | Purpose |
|------|---------|
| `app.json` | Expo app configuration |
| `package.json` | Node.js dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `netlify.toml` | Netlify deployment configuration |
| `public/manifest.json` | PWA manifest |
| `dist/manifest.json` | Built PWA manifest |
| `dist/metadata.json` | Build metadata |
| `infra/cdk.json` | AWS CDK configuration |
| `infra/package.json` | Infrastructure dependencies |
| `infra/tsconfig.json` | Infrastructure TypeScript config |

---

## 📊 Documentation by Category

### 🎯 Product & Strategy (5 files)
- `pricing_tiers.md` ⭐ **MOST IMPORTANT**
- `PRODUCT_BACKLOG.md`
- `NEXT_STEPS_LAUNCH_PLAN.md`
- `PROJECT_JOURNEY.md`
- `docs/SUBSCRIPTION_TIERS.md`

### 🏗️ Architecture & Technical (6 files)
- `CROSS_PLATFORM_STRATEGY.md`
- `EXTERNAL_SERVICES_REGISTRY.md`
- `docs/ARCHITECTURE_COMPASS_V2.md`
- `docs/ARCHITECTURE_V3_CONSOLIDATION.md`
- `docs/USER_GUIDE_FOR_AGENTS.md` ⭐
- `.agent/rules.md` ⭐

### 🚀 Deployment & Operations (4 files)
- `DEVELOPMENT_STRATEGY.md`
- `PWA_DEPLOYMENT_PLAN.md`
- `docs/DEPLOYMENT_CHECKLIST.md`
- `.agent/workflows/bump_version.md`

### ⚖️ Legal & Compliance (2 files)
- `PRIVACY_POLICY.md` ⭐ **App Store Required**
- `TERMS_OF_SERVICE.md` ⭐ **App Store Required**

### 📝 Planning & Backlog (3 files)
- `TODO.md`
- `docs/BACKLOG.md`
- `docs/NEXT_SESSION_PLAN.md`

### 📖 User Documentation (2 files)
- `README.md` (needs updating)
- `docs/HELP_CENTER_DRAFTS.md`

### 🗄️ Database (22 SQL files)
- Complete migration history documenting schema evolution

### 🔍 Reference/Misc (2 files)
- `blackboard.md`
- `AGENT_SIGNAL.md`

---

## ⚠️ Documentation Health & Recommendations

### ✅ Strengths
1. **Comprehensive pricing documentation** - `pricing_tiers.md` is exceptionally detailed
2. **Legal compliance** - Privacy Policy and Terms of Service are complete and current
3. **Clear deployment strategy** - Multiple deployment guides with specific workflows
4. **Database documentation** - Excellent migration file organization
5. **Agent-friendly** - Strong documentation for AI collaboration

### ⚠️ Areas for Improvement
1. **README.md** - Still contains generic Expo boilerplate; should be updated with OpusMode-specific information
2. **Duplicate/Overlapping Docs** - `pricing_tiers.md` vs `docs/SUBSCRIPTION_TIERS.md` may contain conflicting information
3. **Incomplete Views** - Several docs files not fully reviewed (CRM_SCOUT_PLAN, HELP_CENTER_DRAFTS, etc.)
4. **Date Tracking** - Most files lack "Last Updated" dates
5. **Consolidation Opportunity** - Consider merging related docs (e.g., multiple architecture files)

### 📌 Critical Documents for Review
1. **[pricing_tiers.md](file:///Users/robfisch/Documents/OpusMode/pricing_tiers.md)** - Source of truth for product strategy
2. **[.agent/rules.md](file:///Users/robfisch/Documents/OpusMode/.agent/rules.md)** - Essential for deployment workflow
3. **[PRIVACY_POLICY.md](file:///Users/robfisch/Documents/OpusMode/PRIVACY_POLICY.md)** - Legal requirement
4. **[TERMS_OF_SERVICE.md](file:///Users/robfisch/Documents/OpusMode/TERMS_OF_SERVICE.md)** - Legal requirement
5. **[docs/USER_GUIDE_FOR_AGENTS.md](file:///Users/robfisch/Documents/OpusMode/docs/USER_GUIDE_FOR_AGENTS.md)** - Critical for AI collaboration

---

## 📎 Other Documentation to Review

### Configuration Files
- `app.json` - Expo configuration (app name, version, build numbers)
- `package.json` - Dependencies and npm scripts
- `netlify.toml` - Netlify deployment settings
- `public/manifest.json` - PWA configuration

### Infrastructure
- `infra/` directory - AWS CDK infrastructure as code (10 files)

### Code Documentation
- TypeScript files throughout the codebase likely contain JSDoc comments
- Component-level documentation in `/components`
- Store/state management documentation in `/store`

---

**Total Documentation Files:** 24 markdown files + 22 SQL files + 11 config files = **57 documentation artifacts**
