# OpusMode Feature Backlog

> Near-term actionable work. For Post-MVP ideas, see [`pricing_tiers.md`](file:///home/rob/OpusMode/pricing_tiers.md).

## Mobile / PWA
- [ ] **PWA Install Instructions**: Add a "How to Install" screen or Help section for first-time web visitors explaining how to install the PWA.

## User Account Management
- [ ] **MFA (Multi-Factor Authentication)**: Implement MFA before enabling sensitive account changes. *Blocked on: revenue/margins.*
- [ ] **Update Email Address**: Allow users to change their account email (requires verification flow). *Blocked on: MFA.*
- [ ] **Delete Account**: GDPR-compliant self-serve deletion.
    - 30-day grace period before hard delete
    - Purge all user data from SQL for cost efficiency
    - *Blocked on: MFA*
