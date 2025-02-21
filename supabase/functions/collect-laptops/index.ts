
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body and validate parameters
    const requestData = await req.json()
    const { brands, pages_per_brand = 3 } = requestData

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      console.error('Invalid or missing brands array in request')
      return new Response(
        JSON.stringify({ error: 'Invalid or missing brands parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Starting collection for ${brands.length} brands, ${pages_per_brand} pages each`)

    // Background task to collect laptops
    EdgeRuntime.waitUntil((async () => {
      for (const brand of brands) {
        console.log(`Searching for ${brand} laptops...`)
        
        for (let page = 1; page <= pages_per_brand; page++) {
          try {
            console.log(`Processing ${brand} page ${page}...`)
            
            // Structure payload for Oxylabs API
            const payload = {
              source: 'amazon_search',
              query: `${brand} laptop`,
              domain: 'com',
              geo_location: '90210',
              start_page: page.toString(),
              pages: '1',
              parse: true
            }

            // Call Oxylabs API
            const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
              },
              body: JSON.stringify(payload)
            })

            if (!response.ok) {
              console.error(`Oxylabs API error for ${brand} page ${page}: ${response.statusText}`)
              continue
            }

            const data = await response.json()
            
            // Detailed logging of the response structure
            console.log(`Response structure for ${brand} page ${page}:`, {
              hasResults: !!data.results,
              resultsLength: data.results?.length,
              hasContent: !!data.results?.[0]?.content,
              contentResults: !!data.results?.[0]?.content?.results,
              isArray: Array.isArray(data.results?.[0]?.content?.results)
            })
            
            // Validate response structure
            if (!data.results?.[0]?.content?.results) {
              console.log(`No results found for ${brand} on page ${page}`)
              continue
            }

            const results = data.results[0].content.results
            
            // Validate results is an array
            if (!Array.isArray(results)) {
              console.log(`Invalid results format for ${brand} on page ${page}. Expected array, got:`, typeof results)
              continue
            }

            console.log(`Processing ${results.length} results for ${brand} page ${page}`)

            // Process and save each result
            for (const result of results) {
              if (!result?.asin) {
                console.log('Skipping result without ASIN')
                continue
              }

              try {
                // Extract numeric price value with better error handling
                const priceValue = result.price?.value || '0'
                const originalPriceValue = result.price?.original_price || result.price?.value || '0'
                const currentPrice = parseFloat(String(priceValue).replace(/[^0-9.]/g, ''))
                const originalPrice = parseFloat(String(originalPriceValue).replace(/[^0-9.]/g, ''))

                // Save to Supabase
                const { error: upsertError } = await supabase
                  .from('products')
                  .upsert({
                    asin: result.asin,
                    title: result.title || '',
                    current_price: currentPrice,
                    original_price: originalPrice,
                    rating: parseFloat(result.rating || '0'),
                    rating_count: parseInt(result.reviews?.rating_count?.replace(/[^0-9]/g, '') || '0'),
                    image_url: result.image?.url || '',
                    product_url: result.url || '',
                    is_laptop: true,
                    brand: brand,
                    collection_status: 'completed',
                    last_checked: new Date().toISOString(),
                    last_collection_attempt: new Date().toISOString()
                  }, {
                    onConflict: 'asin'
                  })

                if (upsertError) {
                  console.error(`Error saving product ${result.asin}:`, upsertError)
                }
              } catch (productError) {
                console.error(`Error processing product from ${brand} page ${page}:`, productError)
                continue // Continue with next product even if one fails
              }
            }

            // Delay between requests to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 2000))

          } catch (pageError) {
            console.error(`Error processing ${brand} page ${page}:`, pageError)
            continue // Continue with next page even if one fails
          }
        }
      }

      console.log('Laptop collection completed')
    })())

    return new Response(
      JSON.stringify({ message: 'Laptop collection started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
