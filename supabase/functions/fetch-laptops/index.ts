
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

    if (!oxyUsername || !oxyPassword) {
      throw new Error('Oxylabs credentials not configured')
    }

    console.log('Fetching laptops from Oxylabs...')
    
    const oxyResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
      },
      body: JSON.stringify({
        source: 'amazon_search',
        query: 'laptop computers',
        domain: 'com',
        geo_location: 'United States',
        locale: 'en_US',
        start_page: '1',
        pages: 1,
        parse: true
      })
    })

    if (!oxyResponse.ok) {
      throw new Error(`Oxylabs API error: ${oxyResponse.status}`)
    }

    const data = await oxyResponse.json()
    
    if (!data.results?.[0]?.content?.results) {
      throw new Error('No laptop data found in response')
    }

    const laptops = data.results[0].content.results
      .filter((item: any) => item.asin && item.price?.current)
      .map((item: any) => ({
        asin: item.asin,
        title: item.title || '',
        current_price: parseFloat(item.price.current) || 0,
        original_price: parseFloat(item.price.previous || item.price.current) || 0,
        rating: parseFloat(item.rating) || 0,
        rating_count: parseInt(item.ratings_total) || 0,
        image_url: item.image || '',
        product_url: item.url || '',
        category: 'laptop',
        is_laptop: true,
        last_checked: new Date().toISOString()
      }))

    if (laptops.length === 0) {
      throw new Error('No valid laptop data found')
    }

    console.log(`Found ${laptops.length} laptops, upserting to database...`)

    const { error: upsertError } = await supabaseAdmin
      .from('products')
      .upsert(laptops)

    if (upsertError) throw upsertError

    const { data: dbLaptops, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_laptop', true)
      .order('current_price', { ascending: true })

    if (fetchError) throw fetchError

    return new Response(
      JSON.stringify(dbLaptops || []),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in fetch-laptops function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }, 
        status: 500
      }
    )
  }
})
