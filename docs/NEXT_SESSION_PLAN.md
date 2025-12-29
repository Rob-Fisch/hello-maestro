
# Next Session Plan: MVP Strategy & Design Refinement

**Date:** 2025-12-26
**Status:** PWA Deployed & Fixed (Icons + Loading bypass). Pivoting to Product Strategy & Polish.

## 🧠 Strategic Decisions (Confirmed)
1.  **Business Model:** **Annual Membership** ($19.99/year).
    *   **Philosophy:** "Fair & Sustainable." Covers server costs, supports dev. Renewal notices sent early.
    *   **Cost Analysis:** Since AI is "Client-Side Prompt Gen" (User's own LLM) and Sync is low-bandwidth, this price point is sustainable and profitable.
    
2.  **MVP Feature Scope ("The Cut Line")**
    *   **Scout (AI):** No API Integration. "Prompt Engineer" tool only. Locked behind Pro.
    *   **Sync:** Locked behind Pro. Free tier is strictly **Local First**.
    *   **Vault:** Text & Basic details only for MVP. No drag-and-drop gig bags yet.

3.  **Deploy Strategy**
    *   **Beta:** Manual "Drag and Drop" to Netlify (Beta Site).
    *   **Production:** Manual "Drag and Drop" to Netlify (Main Site) when stable.
    *   **PWA:** Infrastructure is FIXED. Icons, Loading, and Sync are operational.

## 🛠️ Technical Tasks for Next Session
1.  **Implement 'The Gate'**:
    *   Add `is_premium` boolean to Supabase `profiles` table.
    *   Create a reusable `<PremiumGate>` component to wrap features like Scout and Sync Settings.
    *   Build a mock "Upgrade" screen (Paywall UI) to test the flow.

2.  **Scout Prompt UI**:
    *   Build the interface where users select their instrument/genre, and we generate the complex prompt text for them to copy.

3.  **Sync Polish**:
    *   Test the "Pull-to-Refresh" mechanism now that the PWA is live.

## 📝 Notes
- **Scout**: Confirmed as a "Huge" value add. Keep polishing.
- **Golden User**: Still needed for testing the MVP flow once defined.
