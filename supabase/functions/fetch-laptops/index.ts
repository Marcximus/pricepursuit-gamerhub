
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
    // First try to get existing laptops
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existingLaptops } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_laptop', true)
      .order('current_price', { ascending: true })

    // Check if we need to fetch new data
    const needsFresh = !existingLaptops || existingLaptops.length === 0 || 
      existingLaptops.every(laptop => {
        const lastChecked = new Date(laptop.last_checked);
        return (new Date().getTime() - lastChecked.getTime()) > 24 * 60 * 60 * 1000;
      });

    if (!needsFresh && existingLaptops) {
      console.log('Returning existing laptops from database');
      return new Response(
        JSON.stringify(existingLaptops),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch fresh data if needed
    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

    if (!oxyUsername || !oxyPassword) {
      throw new Error('Oxylabs credentials not configured')
    }

    console.log('Fetching fresh laptop data...')
    
    const searchResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
      },
      body: JSON.stringify({
        source: 'amazon_search',
        query: 'laptop',
        domain: 'com',
        geo_location: 'United States',
        locale: 'en_US',
        parse: true
      })
    })

    if (!searchResponse.ok) {
      throw new Error(`Oxylabs API error: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    
    if (!searchData?.results?.[0]?.content?.results) {
      throw new Error('Invalid response format from Oxylabs')
    }

    const laptops = searchData.results[0].content.results
      .filter((item: any) => item.asin && item.price?.current)
      .map((item: any) => ({
        asin: item.asin,
        title: item.title || '',
        current_price: parseFloat(item.price.current.replace(/[^0-9.]/g, '')) || 0,
        original_price: parseFloat((item.price.previous || item.price.current).replace(/[^0-9.]/g, '')) || 0,
        rating: parseFloat(item.rating) || 0,
        rating_count: parseInt(item.ratings_total) || 0,
        image_url: item.image || '',
        product_url: item.url || '',
        category: 'laptop',
        is_laptop: true,
        last_checked: new Date().toISOString()
      }))

    if (laptops.length === 0) {
      if (existingLaptops && existingLaptops.length > 0) {
        return new Response(
          JSON.stringify(existingLaptops),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw new Error('No laptop data found')
    }

    // Update database
    const { error: upsertError } = await supabaseAdmin
      .from('products')
      .upsert(laptops)

    if (upsertError) {
      console.error('Error upserting laptops:', upsertError)
      // If upsert fails but we have existing data, return that
      if (existingLaptops && existingLaptops.length > 0) {
        return new Response(
          JSON.stringify(existingLaptops),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw upsertError
    }

    // Get final data
    const { data: finalLaptops, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_laptop', true)
      .order('current_price', { ascending: true })

    if (fetchError) {
      console.error('Error fetching final laptops:', fetchError)
      if (laptops.length > 0) {
        return new Response(
          JSON.stringify(laptops),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw fetchError
    }

    return new Response(
      JSON.stringify(finalLaptops || []),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-laptops function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
