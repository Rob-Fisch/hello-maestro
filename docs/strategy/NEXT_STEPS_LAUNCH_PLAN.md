# OpusMode: Launch & Go-to-Market Action Plan

## Phase 1: Quality Assurance & Validation
- [ ] **Comprehensive Testing:**
  - **iOS:** Test full flows (Signup -> Scout -> Event Creation) on Simulator.
  - **Web (Desktop & Mobile):** Verify layout and functionality on Chrome and Safari.
  - **PWA (Android):** Verify "Add to Home Screen" experience and offline capability.
- [ ] **Beta Distribution (iOS):**
  - Enroll in **Apple Developer Program** ($99/year).
  - Configure **TestFlight** in App Store Connect.
  - Invite beta testers (e.g., your son) via email to install the native beta build.
- [ ] **Feedback Loop:**
  - Implement a simple "Report Bug" button or feedback form in the settings menu.
  - (Optional) Set up basic analytics (e.g., PostHog) to track feature usage (Scout vs. Gig Calendar).

## Phase 2: Content & Marketing Assets
- [ ] **Video Tutorials:**
  - **Capture:** Record raw workflows using Snagit (ensure cursor is visible).
  - **Edit:** Polish in Final Cut Pro (add voiceover/text overlays).
  - **Host:** Upload `.mp4` files to your WordPress Media Library.
  - **Integrate:** Add URLs to the `Help & FAQ` screen in the app.
- [ ] **Marketing Content:**
  - Draft blog posts focusing on "Musician Productivity" and "Gig Management."
  - Create promotional social media graphics.
- [ ] **App Store Assets:**
  - Generate required screenshots for all device sizes (6.5", 5.5", 12.9" iPad).
  - Write a compelling App Store description and keywords.

## Phase 3: Business & Legal Infrastructure
- [ ] **Legal Pages (Required for App Store):**
  - **Privacy Policy:** Create and host at `opusmode.net/privacy`.
  - **Terms of Use (EULA):** Create and host at `opusmode.net/terms`.
  - **Support URL:** Create a contact form or dedicated page at `opusmode.net/support`.
- [ ] **Communication:**
  - Create an official support email (e.g., `support@opusmode.net` or `hello@opusmode.net`).
- [ ] **Payment Infrastructure (Strategy: Web-First):**
  - **Stripe:** Set up specific subscription products (Pro, Pro+).
  - **Web Portal:** Ensure users can upgrade via `opusmode.net` (keeping 97% revenue).
  - **Receipts:** Configure Stripe to send automatic email receipts.

## Phase 4: Final Deployment & Sync
- [ ] **Domain Configuration:**
  - Verify `opusmode.net` DNS settings in Netlify.
  - Update **Supabase Auth** "Redirect URLs" to whitelist `https://opusmode.net`.
- [ ] **Android / PWA:**
  - optimize `manifest.json` and icons to ensure the "Install App" prompt appears on Android devices.
