import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Admin emails allowed to use this function
const ADMIN_EMAILS = [
    'rfisch@robfisch.com',
    'antigravity-pro@opusmode.net'
]

interface AdminRequest {
    action: 'search' | 'grant' | 'revoke'
    email?: string
    userId?: string
    tier?: 'pro' | 'pro_plus'
    proSource?: 'promo_lifetime' | 'promo_trial'
}

serve(async (req) => {
    // CORS headers for browser requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, content-type',
            }
        })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

        // Create client with anon key to verify the caller's identity
        const authClient = createClient(supabaseUrl, supabaseAnonKey)

        // Get the JWT from the request header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            })
        }

        // Verify the caller's identity
        const token = authHeader.replace('Bearer ', '')
        const { data: { user: caller }, error: authError } = await authClient.auth.getUser(token)

        if (authError || !caller) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            })
        }

        // Check if caller is an admin
        if (!ADMIN_EMAILS.includes(caller.email || '')) {
            console.warn(`Unauthorized admin access attempt by: ${caller.email}`)
            return new Response(JSON.stringify({ error: 'Access denied. Admin only.' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            })
        }

        console.log(`Admin action by: ${caller.email}`)

        // Now use service role client for admin operations
        const adminClient = createClient(supabaseUrl, supabaseServiceKey)

        const body: AdminRequest = await req.json()
        const { action, email, userId, tier, proSource } = body

        // SEARCH: Find user by email
        if (action === 'search') {
            if (!email) {
                return new Response(JSON.stringify({ error: 'Email required for search' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                })
            }

            const { data, error } = await adminClient.auth.admin.listUsers()

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                })
            }

            // Filter by email (case insensitive)
            const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

            if (!user) {
                return new Response(JSON.stringify({ error: 'User not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                })
            }

            return new Response(JSON.stringify({
                user: {
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at,
                    last_sign_in_at: user.last_sign_in_at,
                    user_metadata: user.user_metadata
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            })
        }

        // GRANT: Grant Pro access
        if (action === 'grant') {
            if (!userId || !tier || !proSource) {
                return new Response(JSON.stringify({ error: 'userId, tier, and proSource required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                })
            }

            const { error } = await adminClient.auth.admin.updateUserById(userId, {
                user_metadata: {
                    is_premium: true,
                    tier: tier,
                    proSource: proSource
                }
            })

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                })
            }

            console.log(`Granted ${tier} (${proSource}) to user ${userId}`)

            return new Response(JSON.stringify({ success: true, message: `Granted ${tier} access` }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            })
        }

        // REVOKE: Revoke Pro access
        if (action === 'revoke') {
            if (!userId) {
                return new Response(JSON.stringify({ error: 'userId required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                })
            }

            const { error } = await adminClient.auth.admin.updateUserById(userId, {
                user_metadata: {
                    is_premium: false,
                    tier: 'free',
                    proSource: null
                }
            })

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                })
            }

            console.log(`Revoked Pro from user ${userId}`)

            return new Response(JSON.stringify({ success: true, message: 'Revoked Pro access' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            })
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })

    } catch (err) {
        console.error('Admin API error:', err)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
    }
})
