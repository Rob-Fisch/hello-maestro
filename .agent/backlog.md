# OpusMode Development Backlog

> Living document of prioritized work items. Update after each session.

## 🔥 Next Up (High Priority)

### 1. "Message All Confirmed" Feature
- Add "📱 Message Team" button to Contacts tab in Gig Editor
- Collect phone numbers from all `status: 'confirmed'` slots
- Use Web Share API (`navigator.share()`) to open native share sheet
- Pre-compose message with gig details (date, venue, load-in time)
- **Estimate**: ~2 hours

### 2. Link Rehearsals to Gig + Pre-Gig Timeline
- Add `parentEventId` field to events
- UI to select parent gig when creating rehearsal
- Display "Pre-Gig Timeline" section on Event Dashboard showing linked events
- **Estimate**: ~3 hours

### 3. Set List "Prepared" Checkbox
- Add `isPrepared: boolean` field to set lists
- Simple checkbox UI on Set List tab: "☐ Set List Prepared"
- Visual indicator on Event Dashboard if not prepared
- **Estimate**: ~30 minutes

---

## 🧭 Strategic Roadmap (Medium Priority)

### Navigation Redesign
- Make Event Dashboard the central hub
- "What's Next" home experience showing upcoming gigs
- Reduce drawer clutter, elevate context
- Consider pain-point-focused messaging

### Live Mode Access
- Currently hidden (Performance Management page is `hidden: true`)
- Need accessible entry point for "Go Live" from Event Dashboard or Set List

