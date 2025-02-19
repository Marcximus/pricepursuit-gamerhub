
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
    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch laptop data from Oxylabs
    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

    if (!oxyUsername || !oxyPassword) {
      throw new Error('Oxylabs credentials not configured')
    }

    console.log('Fetching laptops from Oxylabs...')
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
    console.log('Oxylabs response received')
    
    if (!data.results?.[0]?.content?.results) {
      throw new Error('No laptop data found in Oxylabs response')
    }

    const laptops = data.results[0].content.results.map((item: any) => ({
      asin: item.asin,
      title: item.title,
      current_price: item.price?.current || 0,
      original_price: item.price?.previous || item.price?.current || 0,
      rating: item.rating || 0,
      rating_count: item.ratings_total || 0,
      image_url: item.image,
      product_url: item.url,
      category: 'laptop',
      is_laptop: true,
      last_checked: new Date().toISOString()
    }))

    console.log(`Processing ${laptops.length} laptops...`)

    // Upsert laptop data
    const { error: upsertError } = await supabaseAdmin
      .from('products')
      .upsert(laptops)

    if (upsertError) {
      console.error('Error upserting laptops:', upsertError)
      throw upsertError
    }

    // Fetch the updated laptops
    const { data: dbLaptops, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_laptop', true)
      .order('current_price', { ascending: true })

    if (fetchError) {
      console.error('Error fetching laptops after upsert:', fetchError)
      throw fetchError
    }

    console.log(`Successfully processed ${dbLaptops.length} laptops`)

    return new Response(
      JSON.stringify(dbLaptops),
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
      JSON.stringify({ error: error.message }),
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
