
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
    const { brands, pages_per_brand = 5 } = requestData

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      console.error('Invalid or missing brands array in request:', requestData)
      return new Response(
        JSON.stringify({ error: 'Invalid or missing brands parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Starting collection for ${brands.length} brands, ${pages_per_brand} pages each`)

    // Background task to collect laptops
    EdgeRuntime.waitUntil((async () => {
      let totalProcessed = 0
      let totalSaved = 0

      for (const brand of brands) {
        console.log(`\n=== Starting collection for brand: ${brand} ===`)
        
        try {
          // Structure payload for Oxylabs API to fetch all pages at once
          const payload = {
            source: 'amazon_search',
            query: `${brand} laptop`,
            domain: 'com',
            geo_location: '90210',
            start_page: '1',
            pages: pages_per_brand.toString(),
            parse: true
          }

          console.log(`Sending request to Oxylabs API for brand ${brand}...`, payload)

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
            console.error(`Oxylabs API error for ${brand}:`, {
              status: response.status,
              statusText: response.statusText
            })
            continue
          }

          const data = await response.json()
          console.log('Received Oxylabs response for brand:', brand, {
            hasResults: !!data.results,
            resultsLength: data.results?.length,
            firstResultContent: data.results?.[0]?.content ? 'present' : 'missing'
          })

          if (!data.results?.[0]?.content?.results) {
            console.log(`No valid results found for ${brand}. Response structure:`, {
              hasResults: !!data.results,
              firstResult: data.results?.[0] ? 'present' : 'missing',
              contentPresent: data.results?.[0]?.content ? 'yes' : 'no',
            })
            continue
          }

          // Process all results from all pages
          const allResults = data.results.flatMap(page => page.content.results || [])
          console.log(`Processing ${allResults.length} total results for ${brand}`)

          // Process and save each result
          let brandProcessed = 0
          let brandSaved = 0

          for (const result of allResults) {
            brandProcessed++
            totalProcessed++

            if (!result?.asin) {
              console.log('Skipping result without ASIN:', {
                title: result?.title || 'no title',
                price: result?.price?.value || 'no price',
                hasUrl: !!result?.url
              })
              continue
            }

            try {
              // Extract numeric price value with better error handling
              const priceValue = result.price?.value || '0'
              const originalPriceValue = result.price?.original_price || result.price?.value || '0'
              const currentPrice = parseFloat(String(priceValue).replace(/[^0-9.]/g, ''))
              const originalPrice = parseFloat(String(originalPriceValue).replace(/[^0-9.]/g, ''))

              // Prepare product data with validation
              const productData = {
                asin: result.asin,
                title: result.title || '',
                current_price: isNaN(currentPrice) ? null : currentPrice,
                original_price: isNaN(originalPrice) ? null : originalPrice,
                rating: parseFloat(result.rating || '0'),
                rating_count: parseInt(result.reviews?.rating_count?.replace(/[^0-9]/g, '') || '0'),
                image_url: result.image?.url || '',
                product_url: result.url || '',
                is_laptop: true,
                brand: brand,
                collection_status: 'completed',
                last_checked: new Date().toISOString(),
                last_collection_attempt: new Date().toISOString()
              }

              // Log the data being saved
              console.log(`Saving product ${result.asin}:`, {
                title: productData.title.substring(0, 50) + '...',
                price: productData.current_price,
                originalPrice: productData.original_price,
                rating: productData.rating,
                ratingCount: productData.rating_count
              })

              // Upsert to Supabase with conflict handling on ASIN
              const { error: upsertError } = await supabase
                .from('products')
                .upsert(productData, {
                  onConflict: 'asin',
                  ignoreDuplicates: false
                })

              if (upsertError) {
                console.error(`Error saving product ${result.asin}:`, upsertError)
              } else {
                brandSaved++
                totalSaved++
                console.log(`Successfully saved/updated product ${result.asin}`)
              }
            } catch (productError) {
              console.error(`Error processing product from ${brand}:`, {
                error: productError.message,
                asin: result?.asin,
                title: result?.title
              })
              continue
            }
          }

          console.log(`\nBrand ${brand} summary:`, {
            processed: brandProcessed,
            saved: brandSaved,
            skipped: brandProcessed - brandSaved
          })

          // Add delay between brands to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000))

        } catch (brandError) {
          console.error(`Error processing brand ${brand}:`, {
            error: brandError.message,
            stack: brandError.stack
          })
          continue
        }
      }

      console.log('\n=== Collection Process Summary ===')
      console.log({
        totalProcessed,
        totalSaved,
        totalSkipped: totalProcessed - totalSaved,
        brandsProcessed: brands.length,
        pagesPerBrand: pages_per_brand
      })
    })())

    return new Response(
      JSON.stringify({ 
        message: 'Laptop collection started',
        details: {
          brands: brands.length,
          pagesPerBrand: pages_per_brand
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Critical error in collect-laptops:', {
      error: error.message,
      stack: error.stack
    })
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
