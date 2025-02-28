
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from './cors.ts'
import { createOxylabsClient } from './oxylabsService.ts'
import { supabase } from './supabaseClient.ts'
import { processProduct } from './productProcessor.ts'

interface RequestData {
  brands: string[]
  pagesPerBrand: number
  detailedLogging?: boolean
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

serve(async (req) => {
  console.log('Request received:', new Date().toISOString())

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  try {
    // Parse the request body
    const requestData: RequestData = await req.json()
    const { brands, pagesPerBrand, detailedLogging = false } = requestData

    console.log(`Starting laptop collection for brands: ${brands.join(', ')}`)
    console.log(`Pages per brand: ${pagesPerBrand}`)
    console.log(`Detailed logging: ${detailedLogging}`)

    // Create a client for the data collection service
    const oxylabsClient = createOxylabsClient()

    // Process all brands in sequence
    const results = await processAllBrands(brands, pagesPerBrand, oxylabsClient, detailedLogging)

    console.log('Collection process completed')
    console.log('Results:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Laptop collection initiated',
        stats: results.stats
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in collect-laptops function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        error: error.toString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    )
  }
})

async function processAllBrands(
  brands: string[],
  pagesPerBrand: number,
  oxylabsClient: any,
  detailedLogging: boolean
) {
  const totalStats = {
    processed: 0,
    added: 0,
    updated: 0,
    failed: 0,
    skipped: 0
  }

  for (const brand of brands) {
    try {
      console.log(`Starting processing for brand: ${brand}`)
      
      // Process each page for the current brand
      for (let page = 1; page <= pagesPerBrand; page++) {
        console.log(`[${brand}] Processing page ${page}/${pagesPerBrand}`)
        
        try {
          // Fetch data from Oxylabs
          console.log(`[Oxylabs] Fetching data for ${brand} - page ${page}`)
          const response = await oxylabsClient.fetchLaptopsByBrand(brand, page)
          
          if (!response || !response.results || !response.results[0] || !response.results[0].content) {
            console.error(`[${brand}] No valid data received for page ${page}`)
            totalStats.failed++
            continue
          }
          
          console.log(`[${brand}] Successfully received data for page ${page}`)
          
          const content = response.results[0].content
          
          // Process the laptops from the content
          if (content.organic) {
            const laptops = content.organic
            
            if (!Array.isArray(laptops)) {
              console.error(`[${brand}] Invalid data format for page ${page} - laptops is not an array:`, typeof laptops)
              totalStats.failed++
              continue
            }
            
            console.log(`[${brand}] Processing ${laptops.length} laptops from page ${page}`)
            
            for (const laptop of laptops) {
              try {
                totalStats.processed++
                
                if (detailedLogging) {
                  console.log(`[${brand}] Processing laptop: ${laptop.title} (ASIN: ${laptop.asin})`)
                }
                
                const result = await processProduct(laptop, brand, detailedLogging)
                
                if (result.status === 'added') {
                  totalStats.added++
                  if (detailedLogging) {
                    console.log(`[${brand}] Added new laptop: ${laptop.title} (ASIN: ${laptop.asin})`)
                  }
                } else if (result.status === 'updated') {
                  totalStats.updated++
                  if (detailedLogging) {
                    console.log(`[${brand}] Updated existing laptop: ${laptop.title} (ASIN: ${laptop.asin})`)
                  }
                } else if (result.status === 'skipped') {
                  totalStats.skipped++
                  if (detailedLogging) {
                    console.log(`[${brand}] Skipped laptop: ${laptop.title} (ASIN: ${laptop.asin}) - Reason: ${result.reason || 'Unknown'}`)
                  }
                } else if (result.status === 'failed') {
                  totalStats.failed++
                  console.error(`[${brand}] Failed to process laptop: ${laptop.title} (ASIN: ${laptop.asin}) - Error: ${result.error}`)
                }
              } catch (laptopError) {
                totalStats.failed++
                console.error(`[${brand}] Error processing laptop from page ${page}:`, laptopError)
              }
            }
          } else {
            console.warn(`[${brand}] No organic results found for page ${page}`)
          }
        } catch (pageError) {
          console.error(`Error processing page ${page} for ${brand}:`, pageError)
          totalStats.failed++
        }
        
        // Add delay between page requests to avoid rate limiting
        if (page < pagesPerBrand) {
          console.log(`[${brand}] Waiting before processing next page...`)
          await sleep(1000)
        }
      }
      
      console.log(`Finished processing brand: ${brand}`)
      console.log(`Brand stats for ${brand}:`, {
        processed: totalStats.processed,
        added: totalStats.added,
        updated: totalStats.updated,
        failed: totalStats.failed,
        skipped: totalStats.skipped
      })
      
    } catch (brandError) {
      console.error(`Error processing brand ${brand}:`, brandError)
    }
  }
  
  console.log('Total stats for all brands:', totalStats)
  
  return {
    success: true,
    stats: totalStats
  }
}
