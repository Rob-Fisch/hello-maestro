# OpusMode PWA Deployment Plan

## 1. The Strategy: "Build & Host"
Since you are using Expo with React Native Web, your PWA is essentially a collection of static files (HTML, JS, CSS). To get it online, we just need to:
1.  **Generate** these files (Build).
2.  **Upload** them to a web host.
3.  **Point** your custom domain to that host.

We will use **Netlify** or **Vercel** as the host. They are the industry standard for this modern "Jamstack" approach, have excellent free tiers, and handle SSL (HTTPS) automatically, which is mandatory for PWAs to work correctly.

---

## 2. Phase 1: Preparation (Local)

Before shipping, we need to ensure the production build has access to your Supabase connection keys.

1.  **Verify Secrets**: Ensure your Supabase URL and Anon Key are accessible to the build process. In Expo, variables prefixed with `EXPO_PUBLIC_` are automatically embedded into the web build.
2.  **Generate the Build**:
    *   We will run `npx expo export -p web`.
    *   This creates a `dist` (or `web-build`) directory containing your optimized website.

## 3. Phase 2: Deployment (Host Setup)

We will use **Netlify** for this example (easiest for manual "drag and drop" deployments to start).

1.  **Create Account**: Sign up for a free Netlify account.
2.  **Deploy**:
    *   Simply drag and drop your local `dist` folder into the Netlify dashboard.
    *   Netlify will instantly give you a live URL (e.g., `opusmode-123.netlify.app`).
3.  **Verify**: Open that URL on your phone. You should see "OpusMode" and be able to "Add to Home Screen".

## 4. Phase 3: Domain Configuration

Once the random Netlify URL is working:

1.  **Add Custom Domain**:
    *   In Netlify Settings > Domain Management, click "Add Custom Domain".
    *   Enter your registered domain (e.g., `opusmode.com`).
2.  **Update DNS (At your Registrar)**:
    *   Netlify will provide you with DNS records (usually an **A Record** pointing to their load balancer IP, or a **CNAME** record).
    *   You log into your domain registrar (GoDaddy, Namecheap, etc.) and copy these records in.
3.  **Wait for Propagation**: It might take a few minutes to hours for the world to see the change.
4.  **Automatic SSL**: Netlify automatically issues a Let's Encrypt SSL certificate so your site loads via `https://`.

## 5. Next Steps

*   **Continuous Deployment**: Later, we can connect your **GitHub** repository to Netlify. This way, every time you `git push` your code, Netlify will automatically rebuild and update the live site.
*   **Offline Support**: Verify the Service Worker is caching correctly (Expo handles most of this, but we should double-check).

---

**Ready to start?**
We can begin by running the build command locally to verify we have a valid `dist` folder ready to ship.
