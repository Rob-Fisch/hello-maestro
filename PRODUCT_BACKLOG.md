# OpusMode Product Backlog

## Next Priority: UX/UI Polish & consistency
- [ ] **Visual Consistency**: Audit and unify buttons, icons, and labeling across all modules.
- [ ] **Color Palette**: Refine and improve color usage (Vibrant vs Muted).
- [ ] **Imagery**: Implement "fading image" aesthetics (Started in Studio) across other key areas.
- [ ] **Upgrade Page**: Redesign the subscription modal with image slider demos to showcase Pro/Pro+ features.

## Post-MVP / Long Term

### Venue Management
- [ ] **Pro Log History Export (CSV)**: Allow users to export their interaction history with venues to a CSV file.
    - **Tier**: Premium Feature.
    - **Context**: Useful for managers who need to do external reporting or analysis.

### Business & Growth Features (Pro+)
- [ ] **Gig Log (Finance Lite)**: Simple income tracker for events.
    - Fields: `Guaranteed Pay`, `Tips`, `Status` (Unpaid, Paid, Deposit Received).
    - Goal: Help users track accounts receivable.
- [ ] **Expense Tracker**: Simple expense logging linked to events or general.
    - Fields: `Category` (Travel, Gear, Food), `Amount`, `Receipt Image`.
    - Goal: Tax deduction tracking.
- [ ] **Fan Magnet (Data Collection)**: QR Code generator for gigs.
    - Output: Hosted web form for fan email signup.
    - Storage: Simple "Contacts" list in user account.

### Asset & Expense Tracker (Formerly "Vault")
- [ ] **Reimagine Gear Vault**: Pivot from simple inventory to financial asset tracking.
    - **Features**: Track purchase dates, prices, depreciation, and insurance documentation.
    - **Goal**: Help professional musicians at tax time and with insurance claims.

### Band Website Builder (Pro++ Tier)
- [ ] **Auto-Generated Musician Websites**: Template-based website generator using existing OpusMode data.
    - **Tier**: Pro++ (Premium tier, potential new tier above Pro+)
    - **Value Proposition**: "Manage your music career AND get a professional website, all from one platform"
    - **Core Pages**:
        - Home (Hero image, bio snippet, CTA)
        - About (Band bio, member profiles from Contacts)
        - Upcoming Shows (Auto-populated from Events/Gigs)
        - Listen (Setlists, streaming links)
        - Merchandise (Optional, future integration)
    - **Technical Approach**:
        - 2-3 starter templates (Classic, Modern, Minimalist)
        - Auto-populate from existing OpusMode data (Events, Setlists, Contacts, Profile)
        - Static site generation (leverage existing Expo/React Native Web)
        - Hosting: Subdomains (`bandname.opusmode.com`) or custom domains (Pro++ feature)
    - **Monetization**:
        - Pro+: Basic template + subdomain hosting
        - Pro++: Advanced templates + custom domain support + priority support
    - **Competitive Edge**: Combines management tools + web presence (vs. Bandzoogle, Wix for Musicians)
    - **Data Sync**: Website auto-updates when user updates Events, Setlists, or Profile in OpusMode
    - **Future Enhancements**: Custom CSS, merchandise integration, mailing list integration
