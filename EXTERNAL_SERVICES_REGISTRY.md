# OpusMode External Services Registry

This document tracks all external services, accounts, and infrastructure components required to run OpusMode.

## 1. Hosting & DNS

### **Netlify** (Web Hosting)
*   **Purpose**: Hosts the PWA (Progressive Web App). Accessible via browser.
*   **Tier**: Pro (~$9/month).
*   **URL**: [app.netlify.com](https://app.netlify.com)
*   **Key Settings**:
    *   **Site Name**: `opusmode-app` (or similar).
    *   **Domains**: `opusmode.net` (Primary).
    *   **Deploy Method**: Netlify CLI (`npx netlify deploy --prod --dir=dist`).

### **AWS Route 53** (Domain Registrar & DNS)
*   **Purpose**: Owns the domain name `opusmode.net` and manages DNS records.
*   **Tier**: Paid (Yearly/Monthly domain fees).
*   **URL**: [aws.amazon.com/route53](https://console.aws.amazon.com/route53/v2/hostedzones)
*   **Key Settings**:
    *   **Nameservers**: Pointing to Netlify (`dns1.p03.nsone.net`, etc.).

---

## 2. Backend & Database

### **Supabase** (Database)
*   **Purpose**: The "Brain". Stores all user data (Events, Routines, Contacts, Gear) and handles Authentication.
*   **Tier**: Free (will upgrade when needed).
*   **URL**: [supabase.com/dashboard](https://supabase.com/dashboard/project/_/settings/general)
*   **Key Components**:
    *   **Authentication**: Email/Password.
    *   **Database**: Postgres.
    *   **Storage**: Buckets for images/PDFs.
    *   **Edge Functions**: (None yet).

---

## 3. Payments

### **Lemon Squeezy + Stripe** (Payment Processing)
*   **Purpose**: Handles Pro/Pro+ subscriptions, checkout, and recurring billing.
*   **Tier**: Active (approved Jan 2026).
*   **URL**: [app.lemonsqueezy.com](https://app.lemonsqueezy.com)

#### Products & Variant IDs

| Product | Monthly Variant | Annual Variant | Product UUID |
|---------|----------------|----------------|--------------|
| **Pro** | 1240740 | 1240749 | `68c7d257-06f7-4bee-9123-f8fc30c6b172` |
| **Pro+** | 1247769 | 1247770 | `229c8350-1c1d-46bf-8748-027b75f1337a` |

#### Pricing
*   Free: $0 (no credit card required)
*   Pro: $9.99/month or $99/year
*   Pro+: $19.99/month or $199/year

#### Webhook Configuration

*   **Endpoint**: `https://iwobmkglhkuzwouheviu.supabase.co/functions/v1/payment-webhook`
*   **Signing Secret**: Stored in Supabase Edge Functions → Secrets as `LEMON_SQUEEZY_WEBHOOK_SECRET`
*   **Events**: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`, `subscription_payment_success`

> [!IMPORTANT]
> **Critical Deployment Note**: The webhook MUST be deployed with `--no-verify-jwt` flag:
> ```bash
> npx supabase functions deploy payment-webhook --no-verify-jwt
> ```
> Without this flag, Supabase rejects webhooks from Lemon Squeezy with 401 "Missing authorization header".

#### Test Mode Configuration
*   Test Mode has separate products with different variant IDs
*   When testing, set `TEST_MODE = true` in `app/modal/upgrade.tsx`
*   Test Mode and Live Mode webhooks share the same Supabase endpoint and secret

---

## 4. Mobile Build System

### **Expo / EAS** (Expo Application Services)
*   **Purpose**: The "Factory". Builds the native iOS (`.ipa`) and Android (`.apk`) apps. Also sends Over-the-Air (OTA) updates.
*   **Tier**: Free.
*   **URL**: [expo.dev/accounts/robfisch](https://expo.dev)
*   **Key Commands**:
    *   `eas build`: Creates a native app file.
    *   `eas update`: Pushes JavaScript fixes to installed apps instantly.
    *   `npx expo export`: Builds the web version for Netlify.

---

## 5. Development Environment

### **GitHub** (Source Code)
*   **Purpose**: Backup and version control.
*   **URL**: [github.com/robfisch/my-app](https://github.com/robfisch/my-app) (Check exact repo URL).
*   **Role**: The single source of truth for the codebase.

### **Cursor / Antigravity** (IDE & Agent)
*   **Purpose**: The "Engineer". Writes code, manages files, runs terminal commands.

---

## Go-Live Strategy

**Phase 1 (MVP)**: PWA only
- Web-based Progressive Web App
- Works on any device with a browser
- No app store approval needed

**Phase 2**: Apple App Store (iOS)
- Native iOS app via Expo/EAS
- Two Islands sync strategy implemented

**Phase 3 (Maybe)**: Android
- Google Play Store
- Decision pending based on demand

---

## Service Map

```mermaid
graph TD
    User[User Device] -->|Web Browser| Netlify[Netlify (PWA)]
    User -->|Native App| Expo[iOS App (EAS Build)]
    
    Netlify -->|Data API| Supabase[Supabase DB]
    Expo -->|Data API| Supabase
    
    Supabase -->|Auth| Email[Auth Service]
    Supabase -->|Files| Storage[Supabase Storage]
    
    AWS[AWS Route53] -->|DNS| Netlify
```
