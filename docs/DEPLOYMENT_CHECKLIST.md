# OpusMode Deployment Checklist

| Step | Action | Status |
| :--- | :--- | :--- |
| **1. Build** | Run `npx expo export -p web` | ✅ **Verified** |
| **2. Assets** | Check `dist/` for Icons & `manifest.json` | ✅ **Fixed** |
| **3. Config** | Verify `_redirects` for Netlify SPA routing | ✅ **Done** |
| **4. Deploy** | Drag & drop `dist/` to Netlify | 🚀 **Manual** |
| **5. Domain** | Point `opusmode.com` (A/CNAME) -> Netlify | ⏳ **Pending** |

## Health Status (Dec 26, 2025)

| Component | Status | Notes |
| :--- | :--- | :--- |
| **PWA Deployment** | 🚀 **Live** | Hosted on Netlify |
| **App Icons** | ✅ **Fixed** | Verified on iOS Home Screen |
| **Loading Loop** | ✅ **Fixed** | Bypass Implemented |
| **Database** | ✅ **Connected** | Supabase Production Linked |

## Pre-Launch Polish / Assets

- [ ] **Scout Preview**: Create/Implement a series of fading screenshots for the Scout Premium Gate.
- [ ] **Store Screenshots**: Generate high-res screens for App Store submission.
