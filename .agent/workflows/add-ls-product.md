---
description: How to add new Lemon Squeezy products and configure webhooks
---

# Adding New Lemon Squeezy Products

This workflow ensures proper configuration when adding new subscription tiers or products.

## 1. Create Product in Test Mode

1. In Lemon Squeezy, enable **Test Mode** (toggle at bottom-left)
2. Go to **Store → Products → New Product**
3. Configure pricing and variants (Monthly/Annual)
4. Note the **Share URL** (contains product UUID) and **Variant IDs**

## 2. Update App Code

In `app/modal/upgrade.tsx`, add the new product to `CHECKOUT_CONFIG`:

```typescript
// In TEST MODE section:
new_product: {
    productUuid: 'uuid-from-share-url',
    monthlyVariant: 1234567,
    annualVariant: 1234568,
},
```

## 3. Update Webhook

In `supabase/functions/payment-webhook/index.ts`, add variant IDs to `VARIANT_TO_TIER`:

```typescript
// Test Mode - New Product
1234567: 'new_tier', // Monthly
1234568: 'new_tier', // Annual
```

## 4. Test in Test Mode

1. Set `TEST_MODE = true` in upgrade.tsx
2. Run the app and test checkout
3. Use test card: `4242 4242 4242 4242`
4. Verify user metadata updates in Supabase

## 5. Copy to Live Mode

1. In LS Test Mode, open the product
2. Click **"Copy to Live Mode"**
3. Toggle Test Mode OFF
4. Note the **NEW** product UUID and variant IDs (they change!)

## 6. Update Code for Live Mode

Add the Live Mode IDs to `CHECKOUT_CONFIG` (LIVE MODE section) and `VARIANT_TO_TIER`.

## 7. Deploy

```bash
# Deploy webhook (CRITICAL: must use --no-verify-jwt)
npx supabase functions deploy payment-webhook --no-verify-jwt

# Set TEST_MODE = false in upgrade.tsx
# Build and deploy app
npx expo export -p web
npx netlify-cli deploy --prod --dir=dist
```

## Critical Notes

> [!IMPORTANT]
> - Always deploy webhook with `--no-verify-jwt` flag
> - Test Mode and Live Mode have DIFFERENT variant IDs
> - Webhook signing secret must match in LS and Supabase
