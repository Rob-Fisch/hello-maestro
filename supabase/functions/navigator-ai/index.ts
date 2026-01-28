// CORS headers for browser requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Query limits by tier - separate for free and pro templates
// Free: 5/month free templates, 5 lifetime Pro taste tests
// Pro: 10/month per template type
// Pro+: 100/month per template type
const QUERY_LIMITS = {
    'admin': { freeTemplates: 999, proTemplates: 999 },
    'pro_plus': { freeTemplates: 100, proTemplates: 100 },
    'pro_paid': { freeTemplates: 10, proTemplates: 10 },
    'pro_promo': { freeTemplates: 10, proTemplates: 10 },
    'free': { freeTemplates: 5, proTemplates: 0, tasteTestLimit: 5 } // 5 lifetime Pro taste tests
}

// Free templates that anyone can use (with limits)
const FREE_TEMPLATE_IDS = ['public', 'repair'] // Student Stages, Pro Shops

interface RequestBody {
    prompt: string
    templateId: string
    isFreeTemplate?: boolean // Frontend now passes this
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

        // Parse request body first to determine template type
        const body: RequestBody = await req.json()
        const { prompt, templateId } = body

        if (!prompt || !templateId) {
            return new Response(JSON.stringify({ error: 'Missing prompt or templateId' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const isFreeTemplate = FREE_TEMPLATE_IDS.includes(templateId)

        const metadata = user.user_metadata || {}
        const isPremium = metadata.is_premium === true
        const tier = metadata.tier || 'free'
        const proSource = metadata.proSource || 'paid'

        // Get query counts from metadata
        const freeTemplateCount = metadata.navigator_free_query_count || 0
        const proTemplateCount = metadata.navigator_pro_query_count || 0
        const tasteTestCount = metadata.navigator_taste_test_count || 0 // Lifetime, never resets
        const purchasedCredits = metadata.navigator_purchased_credits || 0
        const queryResetDate = metadata.navigator_query_reset_date || null

        // Check if we need to reset monthly counters
        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        let currentFreeCount = freeTemplateCount
        let currentProCount = proTemplateCount

        if (queryResetDate !== currentMonth) {
            // New month, reset monthly counters (not taste test or purchased credits)
            currentFreeCount = 0
            currentProCount = 0
        }

        // Determine limits based on tier
        let limitKey = 'free'
        if (isPremium) {
            if (tier === 'admin') {
                limitKey = 'admin'
            } else if (tier === 'pro_plus') {
                limitKey = 'pro_plus'
            } else if (tier === 'pro') {
                limitKey = proSource === 'paid' ? 'pro_paid' : 'pro_promo'
            } else {
                limitKey = 'pro_promo' // Default for premium users with unrecognized tier
            }
        }

        const limits = QUERY_LIMITS[limitKey as keyof typeof QUERY_LIMITS]

        // Determine which counter to check and limit to use
        let currentCount: number
        let monthlyLimit: number
        let useCredits = false
        let useTasteTest = false

        if (isFreeTemplate) {
            currentCount = currentFreeCount
            monthlyLimit = limits.freeTemplates
        } else {
            // Pro template
            if (isPremium) {
                currentCount = currentProCount
                monthlyLimit = limits.proTemplates
            } else {
                // Free user accessing Pro template - check taste test
                if (tasteTestCount >= (limits as any).tasteTestLimit) {
                    // Out of taste tests - check for purchased credits
                    if (purchasedCredits > 0) {
                        useCredits = true
                        currentCount = 0
                        monthlyLimit = 1 // Will decrement from credits
                    } else {
                        return new Response(JSON.stringify({
                            error: 'Pro subscription required',
                            tasteTestUsed: tasteTestCount,
                            tasteTestLimit: (limits as any).tasteTestLimit,
                            message: 'You\'ve used all your free Pro template samples. Upgrade to Pro for unlimited access!'
                        }), {
                            status: 403,
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                        })
                    }
                } else {
                    // Has taste tests remaining
                    useTasteTest = true
                    currentCount = 0
                    monthlyLimit = 1
                }
            }
        }

        // Check if user has queries remaining (unless using credits or taste test)
        if (!useCredits && !useTasteTest && currentCount >= monthlyLimit) {
            // Check for purchased credits as fallback
            if (purchasedCredits > 0) {
                useCredits = true
            } else {
                return new Response(JSON.stringify({
                    error: 'Monthly query limit reached',
                    templateType: isFreeTemplate ? 'free' : 'pro',
                    limit: monthlyLimit,
                    used: currentCount,
                    resetsAt: currentMonth,
                    purchasedCredits: purchasedCredits
                }), {
                    status: 429,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }
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

        // Update appropriate counter based on what was used
        let newMetadata = { ...metadata, navigator_query_reset_date: currentMonth }
        let queryInfoResponse: any = {}

        if (useCredits) {
            // Decrement purchased credits
            newMetadata.navigator_purchased_credits = purchasedCredits - 1
            queryInfoResponse = {
                source: 'credits',
                creditsRemaining: purchasedCredits - 1
            }
        } else if (useTasteTest) {
            // Increment taste test counter (lifetime)
            newMetadata.navigator_taste_test_count = tasteTestCount + 1
            queryInfoResponse = {
                source: 'taste_test',
                tasteTestUsed: tasteTestCount + 1,
                tasteTestLimit: (limits as any).tasteTestLimit,
                tasteTestRemaining: (limits as any).tasteTestLimit - (tasteTestCount + 1)
            }
        } else if (isFreeTemplate) {
            // Increment free template counter
            const newCount = currentFreeCount + 1
            newMetadata.navigator_free_query_count = newCount
            queryInfoResponse = {
                source: 'monthly',
                templateType: 'free',
                used: newCount,
                limit: monthlyLimit,
                remaining: monthlyLimit - newCount
            }
        } else {
            // Increment pro template counter
            const newCount = currentProCount + 1
            newMetadata.navigator_pro_query_count = newCount
            queryInfoResponse = {
                source: 'monthly',
                templateType: 'pro',
                used: newCount,
                limit: monthlyLimit,
                remaining: monthlyLimit - newCount
            }
        }

        // Also update legacy counter for backwards compatibility
        const totalMonthlyCount = (newMetadata.navigator_free_query_count || 0) + (newMetadata.navigator_pro_query_count || 0)
        newMetadata.navigator_query_count = totalMonthlyCount

        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: newMetadata
        })

        if (updateError) {
            console.error('Failed to update query count:', updateError)
            // Don't fail the request, just log it
        }

        // Return success response
        return new Response(JSON.stringify({
            response: aiResponse,
            queryInfo: queryInfoResponse
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
