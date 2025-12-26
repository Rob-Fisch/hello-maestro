# Cross-Platform Content & Feature Strategy

This document outlines the feature parity gaps between the Native App (iOS/Android) and the Progressive Web App (PWA). It proposes actionable alternatives for PWA users where native APIs are unavailable.

## 1. Feature Matrix

| Feature Category | Native Implementation | PWA Limitation | PWA Proposed Alternative |
| :--- | :--- | :--- | :--- |
| **Messaging** | `Linking.openURL('sms:...')` opens native Messages app. | No direct access to native SMS composer on desktop. | **"Copy to Clipboard"**: Copy message text & recipients. <br> **"Send via..."**: Links for WhatsApp Web / Email. |
| **Calendar Sync** | `Calendar.createEventAsync` writes directly to device calendar. | No direct write access to system calendar (Apple/Google). | **".ics Download"**: Generate an iCalendar file that the user can open/import. |
| **PDF Export** | `expo-print` + `expo-sharing` passes file to system share sheet. | `expo-sharing` is limited; `expo-file-system` undefined. | **Direct Download**: Generate blob and trigger browser download. |
| **Image Upload** | `expo-image-picker` with Camera & Gallery access. | Works via file input, but Camera UI is browser-dependent. | Standard `<input type="file">` behavior (supported by Expo). |
| **Contacts** | `expo-contacts` reads address book. | No access to system contacts. | **Manual Entry Only** (Existing fallback). |
| **Notifications** | Native Push Notifications. | Web Push API (requires extra config). | **In-App Toast** notifications only. |

## 2. Implementation Plan

### A. Calendar Sync (Web)
**Goal**: Allow web users to add events/routines to their calendar.
**Strategy**:
1. Create a utility `createICSFile(event)` that formats data into standard VCALENDAR format.
2. On Web, instead of calling `Calendar.createEventAsync`, create a `Blob` with MIME type `text/calendar`.
3. Trigger a sanitized anchor tag click to download `event_name.ics`.

### B. Messaging / Roster Invites (Web)
**Goal**: Allow web users to invite musicians.
**Strategy**:
1. Detect `Platform.OS === 'web'`.
2. Replace "Send SMS" button with a multi-action dropdown or modal:
    - "Copy Message Text"
    - "Copy Phone Numbers"
    - "Open Email Client" (`mailto:`)

### C. PDF & File Export (Web)
**Goal**: Allow web users to save Set Lists and Gear Reports.
**Strategy**:
1. `expo-print` works on web (generates PDF blob).
2. Instead of `Sharing.shareAsync`, use a web-compatible downloader helper:
   ```typescript
   const downloadWeb = (uri: string, filename: string) => {
       const link = document.createElement('a');
       link.href = uri;
       link.download = filename;
       link.click();
   }
   ```

## 3. Immediate Action Items

- [ ] **Modifty `utils/calendar.ts`**: Implement `.ics` generation for `addUnifiedToCalendar`.
- [ ] **Modify `SmsInviteModal.tsx`**: Add "Copy to Clipboard" fallback for Web.
- [x] **Modify `utils/pdfExport.ts`**: Ensure PDF generation uses web-safe download instead of Sharing.

## 4. Web Layout & Assets (PWA)
- **Viewport Height**: On standard web browsers (especially Safari PWA), flex containers for sidebars must use `height: '100vh'` explicitly. `flex: 1` or `height: '100%'` often collapses if the parent chain isn't strictly sized.
- **Icon Loading**:
  - Must use `useFonts` hook from `expo-font`.
  - Load icons via spread syntax: `...Ionicons.font`.
  - Import explicitly: `import Ionicons from '@expo/vector-icons/Ionicons'`.
- **Z-Index**: Sidebars should have explicit `zIndex` and `position: 'relative'` to ensure they paint above page backgrounds.
