
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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch laptop data from Oxylabs
    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
      },
      body: JSON.stringify({
        source: 'amazon_search',
        query: 'laptops',
        geo_location: 'United States',
        pages: 1,
        parse: true
      })
    })

    const data = await response.json()
    
    if (!data.results?.[0]?.content?.results) {
      throw new Error('No laptop data found')
    }

    const laptops = data.results[0].content.results.map((item: any) => ({
      asin: item.asin,
      title: item.title,
      current_price: item.price?.current,
      original_price: item.price?.previous || item.price?.current,
      rating: item.rating,
      rating_count: item.ratings_total,
      image_url: item.image,
      product_url: item.url,
      category: 'laptop',
      is_laptop: true,
      last_checked: new Date().toISOString()
    }))

    // Upsert laptop data
    const { data: upsertedLaptops, error: upsertError } = await supabaseClient
      .from('products')
      .upsert(laptops)
      .select()

    if (upsertError) throw upsertError

    return new Response(
      JSON.stringify(upsertedLaptops),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
