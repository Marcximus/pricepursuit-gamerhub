
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, mode } = await req.json()
    console.log('Received request with action:', action, 'mode:', mode)

    if (action !== 'start') {
      throw new Error('Invalid action provided - expected "start"')
    }

    // Start the background task without waiting for it to complete
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

    if (!oxyUsername || !oxyPassword) {
      throw new Error('Oxylabs credentials not configured')
    }

    // Update collection status for all laptops to 'collecting'
    const { error: updateError } = await supabaseClient
      .from('products')
      .update({ collection_status: 'collecting' })
      .eq('is_laptop', true)

    if (updateError) {
      throw new Error(`Failed to update collection status: ${updateError.message}`)
    }

    const searchQueries = [
      "laptop computer",
      "gaming laptop",
      "business laptop",
      "student laptop",
    ]

    EdgeRuntime.waitUntil((async () => {
      console.log('Starting laptop collection process...')
      const foundAsins = new Set()

      for (const query of searchQueries) {
        try {
          console.log(`Processing search query: ${query}`)
          
          const payload = {
            source: 'amazon_search',
            query: query,
            domain: 'com',
            geo_location: 'United States',
            pages: '1',
            parse: true
          }

          const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
            },
            body: JSON.stringify(payload)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
          }

          const data = await response.json()
          const results = [
            ...(data.results?.[0]?.content?.results?.organic || []),
            ...(data.results?.[0]?.content?.results?.paid || [])
          ]

          console.log(`Found ${results.length} results for query: ${query}`)

          for (const item of results) {
            if (!item.asin || foundAsins.has(item.asin)) continue

            if (item.title?.toLowerCase().includes('laptop')) {
              foundAsins.add(item.asin)
              
              const productData = {
                asin: item.asin,
                title: item.title,
                current_price: item.price?.value || null,
                original_price: item.price?.before_price || item.price?.value || null,
                rating: parseFloat(item.rating || '0'),
                total_reviews: parseInt(item.reviews_count?.toString().replace(/,/g, '') || '0', 10),
                image_url: item.url_image || item.image,
                product_url: `https://www.amazon.com/dp/${item.asin}`,
                is_laptop: true,
                collection_status: 'collected',
                last_checked: new Date().toISOString()
              }

              const { error: insertError } = await supabaseClient
                .from('products')
                .upsert([productData])

              if (insertError) {
                console.error(`Error saving product ${item.asin}:`, insertError)
              } else {
                console.log(`Successfully saved laptop: ${item.asin}`)
              }
            }
          }
        } catch (error) {
          console.error(`Error processing query "${query}":`, error)
        }
      }

      // Mark collection as complete
      const { error: finalUpdateError } = await supabaseClient
        .from('products')
        .update({ collection_status: 'completed' })
        .eq('collection_status', 'collecting')

      if (finalUpdateError) {
        console.error('Error updating final collection status:', finalUpdateError)
      }
      
      console.log(`Collection complete. Found ${foundAsins.size} unique laptops`)
    })())

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Laptop collection started in background.',
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in collect-laptops function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
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
