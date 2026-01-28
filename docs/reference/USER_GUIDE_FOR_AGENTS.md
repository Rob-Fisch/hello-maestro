# User Interaction Guide & Preferences

This document serves as a memory bank for the user's specific working style and preferences.

## 🚨 Critical Communication Protocols

### The "I Wonder" Protocol
**Trigger**: When the user says **"I wonder..."** or similar speculative phrases.
**Interpretation**: The user is seeking **Advice, Consultation, and Strategic Evaluation**. They are NOT asking for immediate code implementation.
**Required Action**:
1.  **Stop**: Do not generate code immediately.
2.  **Analyze**: Evaluate the technical pros, cons, and implications of the idea (e.g., "Linking Venue Data: Relational Database vs. String Copy").
3.  **Propose**: Present options with trade-offs.
4.  **Wait**: Await explicit confirmation to proceed.

---

## Technical Preferences
*   **AI Strategy**: **Manual Handoff**. Avoid direct LLM API integration. User prefers generating prompts (Scout) and manually handling results.
*   **Navigation**: **Hub & Spoke**. The Home screen is the central switchboard.
*   **Styling**: **Premium & Dynamic**. Avoid "minimum viable" looks. Use glassmorphism, rich gradients, and animations.
*   **Data Model**: **Venue-Centric CRM**. Moving towards managing Venues as the primary entity, with People attached.

## Project Context
*   **App Name**: OpusMode (formerly HelloMaestro).
*   **Target Audience**: Musicians managing their own careers (Gigs, Teaching, Gear).

## 🚀 Deployment & Sync Quirks
*   **PWA Icons**: The web build process sometimes ignores `+html.tsx`.
    *   **Fix**: If icons are missing on `opusmode.net`, verify `dist/index.html` contains the manual `<style>@font-face...</style>` injection or `dist/Ionicons.ttf` exists.
*   **PDFs on Web**: Native `Sharing.shareAsync` fails on web. Use `window.open(uri, '_blank')`.
*   **Manual Deploy**: Netlify is NOT auto-deploying. Run `npx expo export -p web` locally, then drag-and-drop the `dist` folder to Netlify Dashboard.
*   **Sync Behavior**: There is NO real-time socket sync. Data is pushed to Supabase on save. To see changes on another device, **restart the app** or implement a "Pull-to-Refresh".
