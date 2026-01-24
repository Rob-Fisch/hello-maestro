// CORS headers for browser requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Query limits by tier and source
const QUERY_LIMITS: Record<string, number> = {
    'pro_plus': 100,
    'pro_paid': 30,
    'pro_promo': 15,
    'free': 0
}

interface RequestBody {
    prompt: string
    templateId: string
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get user from JWT
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Create Supabase client with service role to read/write user data
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Verify user token
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const metadata = user.user_metadata || {}
        const isPremium = metadata.is_premium === true
        const tier = metadata.tier || 'free'
        const proSource = metadata.proSource || 'paid'

        // Check if user has Pro access
        if (!isPremium) {
            return new Response(JSON.stringify({ error: 'Pro subscription required' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Determine query limit based on tier and source
        // If user is premium but tier is not set correctly, default to pro_promo
        let limitKey = 'pro_promo' // Default for premium users with unrecognized tier
        if (tier === 'pro_plus') {
            limitKey = 'pro_plus'
        } else if (tier === 'pro') {
            limitKey = proSource === 'paid' ? 'pro_paid' : 'pro_promo'
        }
        const monthlyLimit = QUERY_LIMITS[limitKey] || 15 // Fallback to 15 if missing

        // Get current query count from metadata
        const queryCount = metadata.navigator_query_count || 0
        const queryResetDate = metadata.navigator_query_reset_date || null

        // Check if we need to reset the counter (new month)
        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        let currentQueryCount = queryCount

        if (queryResetDate !== currentMonth) {
            // New month, reset counter
            currentQueryCount = 0
        }

        // Check if user has queries remaining
        if (currentQueryCount >= monthlyLimit) {
            return new Response(JSON.stringify({
                error: 'Monthly query limit reached',
                limit: monthlyLimit,
                used: currentQueryCount,
                resetsAt: currentMonth
            }), {
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Parse request body
        const body: RequestBody = await req.json()
        const { prompt, templateId } = body

        if (!prompt || !templateId) {
            return new Response(JSON.stringify({ error: 'Missing prompt or templateId' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Call Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                })
            }
        )

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            console.error('Gemini API error:', errorText)
            return new Response(JSON.stringify({ error: 'AI service error' }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const geminiData = await geminiResponse.json()
        const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'

        // Increment query count in user metadata
        const newQueryCount = currentQueryCount + 1
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...metadata,
                navigator_query_count: newQueryCount,
                navigator_query_reset_date: currentMonth
            }
        })

        if (updateError) {
            console.error('Failed to update query count:', updateError)
            // Don't fail the request, just log it
        }

        // Return success response
        return new Response(JSON.stringify({
            response: aiResponse,
            queryInfo: {
                used: newQueryCount,
                limit: monthlyLimit,
                remaining: monthlyLimit - newQueryCount
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error('Navigator AI error:', error)
        return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
