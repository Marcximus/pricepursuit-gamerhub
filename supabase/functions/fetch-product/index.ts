
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { asin } = await req.json()

    if (!asin) {
      return new Response(
        JSON.stringify({ error: 'ASIN is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')
    const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

    if (!OXYLABS_USERNAME || !OXYLABS_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'Oxylabs credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

    // Structure payload for Oxylabs
    const payload = {
      source: 'amazon_product',
      query: asin,
      domain: 'com',
      geo_location: '90210',
      parse: true
    }

    console.log('Fetching product data from Oxylabs for ASIN:', asin)

    // Make request to Oxylabs
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Oxylabs API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Received response from Oxylabs:', data)

    if (!data.results || !data.results[0] || !data.results[0].content) {
      throw new Error('Invalid response from Oxylabs')
    }

    const productData = data.results[0].content
    console.log('Processed product data:', productData)

    // Update product in database
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        title: productData.title,
        current_price: productData.price?.current,
        original_price: productData.price?.before_price || productData.price?.current,
        rating: productData.rating?.rating || null,
        rating_count: productData.rating?.rating_count || null,
        image_url: productData.images?.[0] || null,
        product_url: productData.url,
        last_checked: new Date().toISOString(),
        processor: productData.specifications?.processor,
        ram: productData.specifications?.ram,
        storage: productData.specifications?.storage,
        screen_size: productData.specifications?.screen_size,
        graphics: productData.specifications?.graphics,
        weight: productData.specifications?.weight,
        battery_life: productData.specifications?.battery_life
      })
      .eq('asin', asin)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify(updatedProduct),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

