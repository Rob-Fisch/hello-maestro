# Next Session Plan: Native Polish & Simulator Testing

**Date:** 2025-12-30
**Status:** UI Architecture Refactor Complete (Dark Main / Light Modals). Xcode Installed.

## 🎯 Primary Objectives
1.  **Activate iOS Simulator**
    *   Since Xcode is now installed, the priority is to get the app running on the iOS Simulator.
    *   **Goal:** Validate "Dark Glass" blur effects, Safe Area insets (notches), and Keyboard avoidance on a "real" device.
    *   *Note:* Blur views often behave differently on Web vs Native.

2.  **Visual QA & "Legacy" Cleanup**
    *   Review remaining pages that weren't explicitly refactored in the last batch to ensure they match the new themes.
        *   `app/(drawer)/history.tsx` (Check if this needs Dark Glass).
        *   `app/(drawer)/content/index.tsx` (Level 1 Library - likely needs Dark Glass).
        *   `app/(drawer)/scout.tsx` (Verify styling).
    *   **Consistency Check:** Verify header font sizes and margins are identical across Studio, Performance, and Schedule.

3.  **Data Entry Polish**
    *   Verify the "Light Mode" modals (Routine, Block, Event Editors) feel consistent.
    *   Check keyboard handling on mobile (KeyboardAvoidingView behavior).

## ⏸️ On Hold / Backlog
*   **Gear Vault (`gear-vault.tsx`):** Explicitly paused. Will revisit post-MVP or when directed.
*   **Production Build:** Focus is on Simulator testing first.

## 🛠️ Technical Context
*   **Theme Engine:** Explicit NativeWind classes are currently preferred over `useTheme()` for the complex Glass/Light split.
*   **Icons:** "Icon + Label" pattern is the standard for buttons. Vibrant colors are the standard for data-rich lists.
