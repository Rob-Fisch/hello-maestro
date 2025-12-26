
# Next Session Plan: User Management & Testing

**Date:** 2025-12-24
**Context:** User is taking a break. Returning to focus on multi-user testing.

## Objectives
1.  **Create "Golden User" (Demo Account)**
    -   Purpose: A realistic model for demos/videos.
    -   Requirement: Eventually make this "Read-Only" for public viewers (or shared credentials where writes are disabled/reset).
    
2.  **Create "Tester User"**
    -   Purpose: To test the "Public Sharing" and "Forking" workflows.
    -   Goal: Verify that User A (Golden) can publish a path, and User B (Tester) can see it and fork it.

## Technical Tasks
-   [ ] Sign up 2 new accounts via the App UI (or Supabase dashboard).
-   [ ] Populate the "Golden User" with the new Compass V2 data (Routines, Resources, Tasks).
-   [ ] Verify the "Gatekeeper" logic prevents the Golden User from accidentally sharing private content.
-   [ ] Sign in as Tester -> Fork the Golden Path -> Verify data integrity.
