# Maestro CRM & Scout Module: Implementation Plan

## Progress Tracking
- [x] **Phase 1: Scout Module (AI Intelligence)**
    - [x] Dedicated `/scout` screen.
    - [x] Prompt Builder ("Gig Hunt", "Teaching", etc.).
    - [x] Mobile-friendly Genre Picker (Modal).
    - [x] Help Guide for Novice AI users (ChatGPT/Gemini links).
- [ ] **Phase 2: Venue Intelligence (Data Model)**
    - [ ] Upgrade Data Model (`Venue` entity).
    - [ ] Link People to Venues.
    - [ ] Manual Entry Workflow for AI Leads.
- [ ] **Phase 3: Relationship Cadence**
    - [ ] "Last Contacted" tracking.
    - [ ] Stale/Fresh status indicators.

## Vision (Revised)
Transform the simple "address book" into a **Career Assistant** that helps musicians:
1.  **Discovery**: Find new venues using AI ("Scout").
2.  **Intelligence**: Capture contextual data ("Vibe", "Schedule Pattern") not just addresses.
3.  **Cadence**: Manage relationships with a "Last Contacted" heartbeat.

## Core Modules

### 1. The Scout (Intel) Module [DEPLOYED]
*Leverages Gen-AI to find leads.*
*   **Location**: `/app/(drawer)/scout.tsx` (Direct link from Home).
*   **Features**:
    *   **Prompt Engine**: Generates copy-paste prompts for ChatGPT.
    *   **Smart Inputs**: Multi-select Genre chips, Zip code radius.
    *   **Education**: Built-in "AI Primer" and Help Guide.

### 2. Venue-Centric Database [PENDING]
*Prioritize Venues over People.*
*   **Venue Record**:
    *   **Name**: (e.g., "The Bishop Hotel")
    *   **Tags/Vibe**: Listening Room, Patio, Loud Bar.
    *   **Schedule Pattern**: "Bookings happen on Tuesdays".
    *   **Strategy**: "Bring own PA".
*   **People Links**:
    *   Link generic `Person` records to `Venue` records.

### 3. Relationship Engine [PENDING]
*Automate the follow-up mindshare.*
*   **Touch Logging**:
    *   "Log Touch" button: Records date of email/call/gig.
    *   Auto-log: If an Event is completed at this Venue, update `lastContacted`.
*   **Status Indicators**:
    *   🟢 Fresh
    *   🔴 Stale

## Next Steps (Session Handoff)
The **Scout** tool is live and polished. The next logical step is to build the destination for the data it generates.
1.  **Update `store/types.ts`**: Define `Venue` and update `Person`.
2.  **Upgrade `person-editor.tsx`**: Add fields for Organization/Venue and Last Contact Date.
3.  **Create `VenueList`**: A view to manage the new Venue entities.
