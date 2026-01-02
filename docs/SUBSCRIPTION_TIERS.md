# OpusMode Subscription Model & Tiers

**Status:** Draft / Alignment Phase
**Last Updated:** Jan 1, 2026

## 1. OpusMode Free ("Puddle Proof")
Target: Hobbyists, single-device users, trial users.

*   **Core Promise:** A fully functional localized practice tool.
*   **Data Storage:** Local Only (`localStorage` / `AsyncStorage`).
    *   *"Puddle Proof":* Data survives app restarts but is lost if app is deleted or device is lost. No backup.
*   **Sync:** None. Single Device only.
*   **Feature Set:**
    *   Unlimited Practice Routines (Local).
    *   Basic Metronome/Tuner.
    *   Calendar View.
    *   **Limits (TBD):**
        *   Likely limit on "Scout AI" requests (0 or very low).
        *   No file uploads (or very small local-only references).

## 2. OpusMode PRO ("Everything Everywhere")
Target: Gigging musicians, serious students, multi-device users.
**Pricing Target:** ~$19.99 / year

*   **Core Promise:** Seamless continuity across iPhone, iPad, and Desktop.
*   **Data Storage:** Cloud Sync (Supabase).
    *   Automatic Backup & Restore.
    *   "Factory Reset" protection (Data lives in cloud).
*   **Sync:** Unlimited devices (verified v1.2.2 architecture).
*   **Feature Set:**
    *   **Global Sync:** The primary driver.
    *   **Scout AI:** Access to Booking Agent / CRM tools.
    *   **Media:** Standard Storage limits (e.g., 1GB) for charts/PDFs.

## 3. OpusMode PRO+ (Name TBD, e.g. "Studio", "Ensemble")
Target: Teachers, Power Users, Media-Heavy Performers.
**Pricing Target:** Higher Tier (TBD)

*   **Core Promise:** A robust digital asset management system for music.
*   **Data Storage:** Expanded Cloud Storage.
*   **Feature Set:**
    *   **Heavy Media Uploads:** Large Audio/Video files attached to blocks.
    *   **Extended Storage:** 50GB+ (vs 1GB for PRO).
    *   **Future Possibilities:**
        *   Student/Teacher Sharing (Push routine to student).
        *   Band Management (Shared Setlists).

---

## 🛠 Feature Gates Development Status

| Feature | Gate Logic | Implementation Status |
| :--- | :--- | :--- |
| **Cloud Sync** | `user.is_premium === true` | ✅ Implemented (v1.2.2) |
| **Simulated "Free"** | `user.is_premium === false` | ✅ Implemented (Local Mode) |
| **Media Uploads** | `user.storage_usage < limit` | 🚧 Not Started |
| **Scout AI** | `user.tier >= PRO` | 🚧 Not Started |

*Note: Currently, the App checks `is_premium` (Boolean) which covers PRO. For PRO+, we will likely need a numeric `tier_level` or specific capability flags in the future.*
