# OpusMode Development & Deployment Strategy

To ensure stability while moving fast, we will adopt a **"Two-Tier" Strategy** for environments. This strikes the right balance for a solo developer or small team: robust enough to prevent breaking "Production", but simple enough to not slow you down.

## 1. Environments

### A. Development (Local)
*   **Purpose**: Where you write code, break things, and experiment.
*   **Where it lives**: Your local machine (`localhost:8081`).
*   **Database**: Connected to your **"Dev"** Supabase project (or a local instance).
*   **Data**: Fake/Mock data or a copy of prod data. **Never** real user data if possible.

### B. Production (Live)
*   **Purpose**: The real world. Stability is key.
*   **Where it lives**: `https://opusmode.com` (Web) and App Store/Play Store (Mobile).
*   **Database**: Connected to your **"Prod"** Supabase project.
*   **Data**: Real user data. **Sacred**. Backed up automatically.

### *Optional: Staging (Preview)*
*   **Purpose**: Testing a specific feature before merging it to production.
*   **Where it lives**: Temporary URLs created by your host (e.g., Netlify/Vercel) automatically when you open a Pull Request on GitHub.
*   **Database**: Usually shares the **"Dev"** database to keep things simple.

---

## 2. Infrastructure Setup

### GitHub (The Source of Truth)
*   **Repository**: Holds all your code.
*   **Branches**:
    *   `main`: This IS production. If code is here, it's live (or about to be).
    *   `dev` or `feature-xyz`: Where you work. You merge these into `main` when ready.

### Supabase (The Backend)
You should ideally have **two** separate projects in Supabase:
1.  `opusmode-dev`: For messing around. You can drop tables, reset data, and break schemas here without fear.
2.  `opusmode-prod`: Locked down. Schema changes are applied carefully (migrations).

### Netlify / Vercel (The Web Host)
*   **Production**: Pointed at the `main` branch. Automatically builds and updates `opusmode.com` whenever you push to `main`.
*   **Previews**: Pointed at Pull Requests. Gives you a URL like `depoly-preview-123--opusmode.netlify.app` to check your work on a phone before merging.

### Expo (The Mobile Build)
*   **EAS Build**: Used to generate `.ipa` (iOS) and `.apk` (Android) files.
*   **OTA Updates**: Expo can push JavaScript updates to installed apps instantly for small bug fixes (bypassing the App Store review for non-native changes).

---

## 3. The Workflow

1.  **Code**: You make changes locally on a feature branch. You test with `npm run web`.
2.  **Commit**: You push your changes to GitHub.
3.  **Review (Optional)**: Netlify builds a "Preview" URL. You check it on your phone.
4.  **Merge**: You merge your code into `main`.
5.  **Deploy (Automatic)**:
    *   **Web**: Netlify detects the merge and updates `opusmode.com` in < 2 minutes.
    *   **Mobile**: If using EAS Update, the changes go out to users. If native code changed, you trigger a new build for the App Store.

## 4. Disaster Recovery & Backups

*   **Code**: GitHub is your backup. Keep it sync'd.
*   **Database**: Supabase provides **Point-in-Time Recovery (PITR)** (Paid tier) or daily backups (Free tier).
    *   *Recommendation*: For now, the Free tier backups are likely sufficient. As you grow, enable PITR.
*   **Assets**: Images/PDFs are stored in Supabase Storage. This is replicated and durable.
*   **"Oh no, I broke Prod"**: Since Netlify keeps a history of deployments, you can "Rollback" to the previous version of the site with **one click** in their dashboard.

---

## Summary Checklist for Next Steps
1.  [ ] **GitHub**: Ensure your code is pushed.
2.  [ ] **Hosting**: Connect Netlify to your GitHub repo.
3.  [ ] **Supabase**: Evaluate if you need a separate `dev` project now or later (can start with one for speed, but split before real users join).
4.  [ ] **Domain**: Purchase/configure `opusmode.com` to point to Netlify.
