# OpusMode Architecture V3: The Consolidation (Level 1 & Level 2)

**Date:** 2025-12-25
**Objective:** Merge "Compass" and "Routines" into a single, linear "Collection" module.

## Core Concepts

### Level 1: "The Atom" (Formerly Content Block)
- **Content:** Text, PDF, Image, Link.
- **Nature:** The actual material to be learned or practiced.

### Level 2: "The Collection" (Formerly Routine / Roadmap)
- **Structure:** A linear, ordered list of Level 1 items.
- **Dual Purpose:** 
  1. **Micro:** A daily practice routine (e.g., "Warmup").
  2. **Macro:** A long-term learning path (e.g., "Learn Jazz Standards").
- **Features:**
  - **Progress Tracking:** Checkboxes for each item. Visual progress bar (% complete).
  - **Reset Progress:** Button to uncheck all (for recurring routines).
  - **Gatekeeper:** Public sharing allowed ONLY if no private file uploads exist in Level 1 items.

## Implementation Plan

1.  **Cleanup:** Remove `pathfinder` (Compass) from navigation.
2.  **Enhance Collection View (app/(drawer)/routines.tsx):**
    -   Add Completion State (Checkboxes) per block.
    -   Add Progress Indicator.
    -   Add 'Reset' button.
    -   Add 'Make Public' toggle with Gatekeeper logic.
3.  **Data Strategy:**
    -   We will leverage the existing `Routine` table/store as the "Level 2" container.
    -   We will use `UserProgress` to store `{ collectionId, blockId, completed: true }`.

## Next Steps
-   Modify `_layout.tsx` to hide Compass.
-   Refactor `routines.tsx` to include the Detail View and Progress Logic.
