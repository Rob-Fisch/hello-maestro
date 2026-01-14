
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Lemon Squeezy Webhook Handler Loaded")

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

    // 3. Handle Subscription Events
    if (['subscription_created', 'subscription_updated', 'subscription_payment_success'].includes(event_name)) {
        const user_id = custom_data.user_id
        const status = data.attributes.status // 'active', 'past_due', etc

        if (user_id) {
            await updatePremiumStatus(user_id, status === 'active')
        }
    }

    // 4. Handle Cancellations / Expirations
    else if (['subscription_cancelled', 'subscription_expired'].includes(event_name)) {
        const user_id = custom_data.user_id
        if (user_id) {
            await updatePremiumStatus(user_id, false)
        }
    }

    return new Response("Webhook received", { status: 200 })
})

// Database Helper
async function updatePremiumStatus(userId: string, isPremium: boolean) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`Updating user ${userId} premium status to: ${isPremium}`)

    // Update the profile directly
    const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { is_premium: isPremium } }
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
