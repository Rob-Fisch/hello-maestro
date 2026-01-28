# Compass V2: The Unified Journey Architecture

**Date:** 2025-12-24
**Status:** Approved / In Implementation

## Core Concept
The "Compass" (Pathways) and "Routines" modules are being merged into a single conceptual framework. We distinguish between the **Macro Journey** and the **Micro Routine**.

- **Journey (Path)**: The "Container" or "Curriculum". It represents the long-term roadmap.
- **Routine**: The "Day-to-Day" practice session. It allows users to execute a specific set of exercises.

## Node Types (Milestones)
A Journey consists of "Nodes" (Milestones). We have formalized three distinct types of nodes:

1.  **Practice Node (Routine)**
    *   **Function**: Links to an executable OpusMode Routine.
    *   **User Action**: Opens the Routine Player.
    *   **Content**: Contains Blocks (Sheet music, Audio, etc.).
    *   **Public Safety**: When sharing a Journey, any private/uploaded content in these Routines must be stripped or flagged.

2.  **Task Node (Action)**
    *   **Function**: A simple checklist item for "Life Admin" or goals.
    *   **Examples**: "Register for Fall Semester", "Submit Application", "Book a Venue".
    *   **User Action**: Checkbox (Complete/Incomplete).

3.  **Resource Node (Material)**
    *   **Function**: Links to external materials.
    *   **Examples**: "Buy Real Book Vol 1", "Watch Masterclass on YouTube", "View Gear Recommendation".
    *   **Revenue**: This is the primary vector for **Affiliate Links**.
    *   **Governance**:
        *   *Private Mode*: Users can save any URL.
        *   *Public Mode*: URLs must be from an **Allowed Domain List** (Partners) or manually vetted to ensure safety and quality.

## "On-the-Fly" Creation
Users must be able to create these assets without context switching.
- From the Compass View -> "Add Node" -> Select Type (Routine) -> "Create New Routine" -> Opens Routine Editor -> Saves & Returns to Compass.

## Data Model Updates
- **`PathNode`**: needs explicit `type` field (`routine`, `task`, `resource`).
- **`LearningPath`**: remains the graph container.

## Future Considerations (Backlog)
- **Storage Quotas**: Implement aggregate storage tracking (e.g., "User has used 400MB / 1GB") in the backend (User Stats table).
- **Premium Tiers**: Charge for additional storage.
