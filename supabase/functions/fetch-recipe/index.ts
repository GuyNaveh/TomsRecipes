// Supabase Edge Function: fetch-recipe
// Fetches a recipe webpage server-side (bypasses browser CORS),
// strips HTML, and uses Claude API to extract structured recipe JSON.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, claudeApiKey } = await req.json()

    if (!url || !claudeApiKey) {
      return new Response(
        JSON.stringify({ error: 'url and claudeApiKey are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the webpage server-side
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he,en;q=0.5',
      },
    })

    if (!pageRes.ok) {
      throw new Error(`לא ניתן לגשת לכתובת: ${pageRes.status} ${pageRes.statusText}`)
    }

    const html = await pageRes.text()

    // Strip HTML — remove scripts, styles, head; prefer article/main content
    let text = html
    text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ')
    text = text.replace(/<head[\s\S]*?<\/head>/gi, ' ')

    // Try to extract main content area (article, main, or .recipe class)
    const mainMatch = text.match(/<(?:article|main)[^>]*>([\s\S]*?)<\/(?:article|main)>/i)
    if (mainMatch) {
      text = mainMatch[1]
    }

    // Strip remaining HTML tags
    text = text.replace(/<[^>]+>/g, ' ')

    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

    // Collapse whitespace
    text = text.replace(/\s{2,}/g, ' ').trim()

    // Truncate to ~6000 characters to stay within Claude context limits
    if (text.length > 6000) {
      text = text.slice(0, 6000)
    }

    if (text.length < 50) {
      throw new Error('לא ניתן לחלץ תוכן מהעמוד')
    }

    // Call Claude API to extract recipe
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: `You are a recipe parser. Extract the recipe from the provided text and return ONLY valid JSON with this exact shape (no markdown, no explanation):
{
  "name": "שם המתכון",
  "type": "regular",
  "tags": [],
  "prepTime": {"value": 30, "unit": "דקות"},
  "servings": 4,
  "ingredients": [{"amount": "2", "unit": "כוס", "name": "קמח"}],
  "instructions": "הוראות הכנה",
  "nutrition": null
}
Units must be one of: כוס, כף, כפית, מ"ל, ליטר, גרם, ק"ג, יחידה, חבילה, קופסה, קורט, לפי הטעם
Time unit must be דקות or שעות. Translate all text to Hebrew where possible.`,
        messages: [{ role: 'user', content: `Extract the recipe from this text:\n\n${text}` }],
      }),
    })

    if (!claudeRes.ok) {
      const err = await claudeRes.json().catch(() => ({}))
      throw new Error((err as any)?.error?.message || `שגיאת Claude API: ${claudeRes.status}`)
    }

    const claudeData = await claudeRes.json()
    const recipeText: string = (claudeData as any).content[0].text

    // Parse the JSON response
    let recipe
    try {
      recipe = JSON.parse(recipeText)
    } catch {
      // Try to extract JSON from the response text
      const match = recipeText.match(/\{[\s\S]*\}/)
      if (match) {
        recipe = JSON.parse(match[0])
      } else {
        throw new Error('לא ניתן לנתח את תגובת Claude')
      }
    }

    return new Response(
      JSON.stringify({ recipe }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'שגיאה לא ידועה' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
