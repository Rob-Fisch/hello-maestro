---
description: Test accounts for Pro and Free tier testing
---

# Test Accounts

Use these accounts to test Pro vs Free tier features.

## Pro Account
- **Email:** antigravity-pro@opusmode.net
- **Password:** !HEbmVp9w_tfbZQauR*
- **Status:** Premium (`is_premium: true`)

## Free Account
- **Email:** antigravity-free@opusmode.net
- **Password:** !HEbmVp9w_tfbZQauR*
- **Status:** Free tier (`is_premium: false`)

## Setting Premium Status (SQL)

If you need to toggle premium status:

```sql
-- Set Pro
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'), 
    '{is_premium}', 
    'true'
)
WHERE email = 'antigravity-pro@opusmode.net';

-- Set Free
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'), 
    '{is_premium}', 
    'false'
)
WHERE email = 'antigravity-free@opusmode.net';
```

## Usage

1. Log out of current account
2. Log in with test account
3. Test the relevant tier features
