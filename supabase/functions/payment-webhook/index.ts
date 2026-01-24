
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Lemon Squeezy Webhook Handler Loaded")

// =============================================================================
// VARIANT ID → TIER MAPPING
// =============================================================================
// Update these IDs when copying products from Test Mode to Live Mode!
//
// TEST MODE (current):
//   Pro Monthly: 1216060, Pro Annual: 1216066
//   Pro+ Monthly: 1247517, Pro+ Annual: 1247518
//
// LIVE MODE (update after "Copy to Live Mode"):
//   Pro Monthly: 1240740, Pro Annual: 1240749
//   Pro+ Monthly: TBD, Pro+ Annual: TBD
// =============================================================================

const VARIANT_TO_TIER: Record<number, 'pro' | 'pro_plus'> = {
    // Test Mode - Pro
    1216060: 'pro',      // Pro Monthly
    1216066: 'pro',      // Pro Annual
    // Test Mode - Pro+
    1247517: 'pro_plus', // Pro+ Monthly
    1247518: 'pro_plus', // Pro+ Annual
    // Live Mode - Pro
    1240740: 'pro',      // Pro Monthly
    1240749: 'pro',      // Pro Annual
    // Live Mode - Pro+
    1247769: 'pro_plus', // Pro+ Monthly
    1247770: 'pro_plus', // Pro+ Annual
}

function getTierFromVariant(variantId: number): 'pro' | 'pro_plus' | null {
    return VARIANT_TO_TIER[variantId] || null
}

serve(async (req) => {
    const secret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET')

    if (!secret) {
        return new Response("Webhook Secret not configured", { status: 500 })
    }

    // 1. Validate Signature
    const signature = req.headers.get("x-signature") || ""
    const body = await req.text()

    const isValid = await verifySignature(secret, signature, body)
    if (!isValid) {
        console.error("Invalid signature")
        return new Response("Invalid signature", { status: 401 })
    }

    // 2. Parse Event
    const event = JSON.parse(body)
    const { meta, data } = event
    const { event_name } = meta
    const custom_data = meta.custom_data || {} // We pass user_id here

    console.log(`Received event: ${event_name}`)

    // Extract variant_id from the subscription data
    const variant_id = data.attributes.variant_id
    console.log(`Variant ID: ${variant_id}`)

    // 3. Handle Subscription Events
    if (['subscription_created', 'subscription_updated', 'subscription_payment_success'].includes(event_name)) {
        const user_id = custom_data.user_id
        const status = data.attributes.status // 'active', 'past_due', etc

        if (user_id && status === 'active') {
            const tier = getTierFromVariant(variant_id)
            if (tier) {
                await updateUserTier(user_id, tier)
            } else {
                console.warn(`Unknown variant_id: ${variant_id}, defaulting to 'pro'`)
                await updateUserTier(user_id, 'pro')
            }
        } else if (user_id && status !== 'active') {
            // Subscription not active (past_due, paused, etc) - downgrade to free
            await updateUserTier(user_id, 'free')
        }
    }

    // 4. Handle Cancellations / Expirations
    else if (['subscription_cancelled', 'subscription_expired'].includes(event_name)) {
        const user_id = custom_data.user_id
        if (user_id) {
            await updateUserTier(user_id, 'free')
        }
    }

    return new Response("Webhook received", { status: 200 })
})

// Database Helper - Now stores tier and proSource
async function updateUserTier(userId: string, tier: 'free' | 'pro' | 'pro_plus') {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // For backwards compatibility, also set is_premium boolean
    const is_premium = tier !== 'free'

    // Track how user became Pro: 'paid' for purchases, null for free tier
    // Note: promo users will have proSource set manually (e.g., 'promo_lifetime')
    const proSource = tier !== 'free' ? 'paid' : null

    console.log(`Updating user ${userId} tier to: ${tier} (is_premium: ${is_premium}, proSource: ${proSource})`)

    // Update the profile with tier, legacy is_premium flag, and proSource
    const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { tier, is_premium, proSource } }
    )

    if (error) {
        console.error("Error updating user metadata:", error)
    } else {
        console.log("Success!")
    }
}

// Security Helper (HMAC-SHA256)
async function verifySignature(secret: string, signature: string, body: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );
    const signatureBytes = hexToBytes(signature);
    return crypto.subtle.verify(
        "HMAC",
        key,
        signatureBytes,
        encoder.encode(body)
    );
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}
