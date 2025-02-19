
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
    const { asin } = await req.json()
    
    if (!asin) {
      return new Response(
        JSON.stringify({ error: 'ASIN is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Check if we have recent data (less than 1 hour old)
    const { data: existingProduct } = await supabaseClient
      .from('products')
      .select('*')
      .eq('asin', asin)
      .gte('last_checked', new Date(Date.now() - 3600000).toISOString())
      .maybeSingle()

    if (existingProduct) {
      return new Response(
        JSON.stringify(existingProduct),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch new data from Oxylabs
    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
      },
      body: JSON.stringify({
        source: 'amazon_product',
        query: asin,
        geo_location: '90210',
        parse: true
      })
    })

    const data = await response.json()
    
    if (!data.results?.[0]?.content) {
      throw new Error('No product data found')
    }

    const productData = data.results[0].content

    // Prepare product data
    const product = {
      asin: asin,
      title: productData.title,
      current_price: productData.price?.current,
      original_price: productData.price?.previous || productData.price?.current,
      rating: productData.rating,
      rating_count: productData.ratings_total,
      image_url: productData.images?.[0],
      product_url: productData.url,
      last_checked: new Date().toISOString()
    }

    // Update or insert product data
    const { data: upsertedProduct, error: upsertError } = await supabaseClient
      .from('products')
      .upsert(product)
      .select()
      .single()

    if (upsertError) throw upsertError

    // Add price history entry
    await supabaseClient
      .from('price_history')
      .insert({
        product_id: upsertedProduct.id,
        price: product.current_price
      })

    return new Response(
      JSON.stringify(upsertedProduct),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
