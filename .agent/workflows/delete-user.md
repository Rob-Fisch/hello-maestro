---
description: How to delete a user from Supabase (manual process until CASCADE migration)
---

# Delete User Workflow

> **Note:** This is a temporary manual process. Once backlog item #27 (CASCADE Foreign Keys) is implemented, user deletion will automatically clean up all data.

## Prerequisites
- Admin access to Supabase Dashboard
- User's email address or UUID

## Steps

### 1. Find the User ID
If you only have the email, find the UUID:
```sql
SELECT id, email FROM auth.users WHERE email = 'user@example.com';
```

### 2. Delete from All Public Tables
Run these in order (replace `USER_UUID` with the actual ID):

```sql
-- Delete user data from all tables
DELETE FROM public.set_lists WHERE user_id = 'USER_UUID';
DELETE FROM public.routines WHERE user_id = 'USER_UUID';
DELETE FROM public.events WHERE user_id = 'USER_UUID';
DELETE FROM public.contacts WHERE user_id = 'USER_UUID';
DELETE FROM public.songs WHERE user_id = 'USER_UUID';
DELETE FROM public.profiles WHERE id = 'USER_UUID';
```

> **If you get a foreign key error:** Add the referenced table to the list and re-run.

### 3. Delete the Auth User
```sql
DELETE FROM auth.users WHERE id = 'USER_UUID';
```

### 4. Verify Deletion
Confirm in Supabase Dashboard → Authentication → Users that the user no longer appears.

---

## Using the Admin Panel (Preferred)
Once the CASCADE migration is complete, use the Admin Panel instead:
1. Go to Admin Panel in the app
2. Search for user by email
3. Click "Delete User" button
4. Confirm deletion

## Tables with User References
As of 2026-01-27:
- `public.profiles` (id → auth.users.id) ✅ Has CASCADE
- `public.songs` (user_id → auth.users.id) ❌ Needs CASCADE
- `public.set_lists` (user_id → auth.users.id) ❌ Needs CASCADE
- `public.routines` (user_id → auth.users.id) ❌ Needs CASCADE
- `public.events` (user_id → auth.users.id) ❌ Needs CASCADE
- `public.contacts` (user_id → auth.users.id) ❌ Needs CASCADE
