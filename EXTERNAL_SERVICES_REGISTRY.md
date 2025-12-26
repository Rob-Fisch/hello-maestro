# OpusMode External Services Registry

This document tracks all external services, accounts, and infrastructure components required to run OpusMode.

## 1. Hosting & DNS

### **Netlify** (Web Hosting)
*   **Purpose**: Hosts the PWA (Progressive Web App). Accessible via browser.
*   **Tier**: Free (Starter).
*   **URL**: [app.netlify.com](https://app.netlify.com)
*   **Key Settings**:
    *   **Site Name**: `opusmode-app` (or similar).
    *   **Domains**: `opusmode.net` (Primary).
    *   **Deploy Method**: Manual Drag & Drop (currently).

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
*   **Tier**: Free.
*   **URL**: [supabase.com/dashboard](https://supabase.com/dashboard/project/_/settings/general)
*   **Key Components**:
    *   **Authentication**: Email/Password.
    *   **Database**: Postgres.
    *   **Storage**: Buckets for images/PDFs.
    *   **Edge Functions**: (None yet).

---

## 3. Mobile Build System

### **Expo / EAS** (Expo Application Services)
*   **Purpose**: The "Factory". Builds the native iOS (`.ipa`) and Android (`.apk`) apps. Also sends Over-the-Air (OTA) updates.
*   **Tier**: Free.
*   **URL**: [expo.dev/accounts/robfisch](https://expo.dev)
*   **Key Commands**:
    *   `eas build`: Creates a native app file.
    *   `eas update`: Pushes JavaScript fixes to installed apps instantly.
    *   `npx expo export`: Builds the web version for Netlify.

---

## 4. Development Environment

### **GitHub** (Source Code)
*   **Purpose**: Backup and version control.
*   **URL**: [github.com/robfisch/my-app](https://github.com/robfisch/my-app) (Check exact repo URL).
*   **Role**: The single source of truth for the codebase.

### **Cursor / Antigravity** (IDE & Agent)
*   **Purpose**: The "Engineer". Writes code, manages files, runs terminal commands.

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
