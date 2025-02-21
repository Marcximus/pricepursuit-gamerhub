
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Response helper
const respond = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    console.log('Received request with action:', action)

    if (action !== 'collect') {
      throw new Error('Invalid action provided')
    }

    // Start the background task without waiting for it to complete
    EdgeRuntime.waitUntil(collectLaptopsTask())

    return respond({
      success: true,
      message: "Laptop collection started in background. This may take several minutes to complete.",
    })

  } catch (error) {
    console.error('Error initiating laptop collection:', error)
    return respond({ 
      success: false,
      error: error.message
    }, 500)
  }
})

async function collectLaptopsTask() {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

    if (!oxyUsername || !oxyPassword) {
      throw new Error('Oxylabs credentials not configured')
    }

    const searchQueries = [
      // Generic laptop searches
      "laptop",
      "notebook computer",
      
      // Major brands with specific models
      "MacBook Pro",
      "MacBook Air",
      "Dell XPS laptop",
      "Lenovo ThinkPad",
      "HP Envy laptop",
      "ASUS ROG laptop",
      "Acer Predator laptop",
      "MSI Gaming laptop",
      "Razer Blade laptop",
      
      // Use cases and categories
      "gaming laptop 2024",
      "business laptop 2024",
      "student laptop 2024",
      "ultrabook 2024",
      
      // Price ranges
      "premium laptop 2024",
      "budget laptop under 500"
    ]

    console.log('Starting laptop collection process...')
    const foundAsins = new Set<string>()
    const errors: { query: string; error: string }[] = []

    for (const query of searchQueries) {
      console.log(`Searching for: ${query}`)
      
      const payload = {
        source: 'amazon_search',
        query: query,
        domain: 'com',
        geo_location: '90210',
        start_page: '1',
        pages: '3',
        parse: true
      }

      try {
        console.log('Making request to Oxylabs with payload:', JSON.stringify(payload))
        
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
        console.log(`Received response for query "${query}"`)

        // Extract both organic and paid results
        const results = [
          ...(data.results?.[0]?.content?.results?.organic || []),
          ...(data.results?.[0]?.content?.results?.paid || [])
        ]
        
        if (results.length === 0) {
          console.log(`No results found for query: ${query}`)
          continue
        }

        console.log(`Found ${results.length} results for query: ${query}`)

        // Process results in smaller batches
        const BATCH_SIZE = 10
        for (let i = 0; i < results.length; i += BATCH_SIZE) {
          const batch = results.slice(i, i + BATCH_SIZE)
          
          for (const item of batch) {
            if (!item.asin || foundAsins.has(item.asin)) continue

            foundAsins.add(item.asin)
            
            // Extract and validate the image URL
            const imageUrl = item.url_image || item.image
            console.log(`Processing item with ASIN ${item.asin}, image URL: ${imageUrl}`)

            const currentPrice = typeof item.price?.value === 'string' 
              ? parseFloat(item.price.value.replace(/[^0-9.]/g, '')) 
              : (typeof item.price?.value === 'number' ? item.price.value : null)
            
            const originalPrice = typeof item.price?.before_price === 'string'
              ? parseFloat(item.price.before_price.replace(/[^0-9.]/g, ''))
              : currentPrice

            // Only process items that look like laptops
            const isLaptop = (item.title || '').toLowerCase().match(/\b(laptop|notebook|macbook|chromebook)\b/)
            if (!isLaptop) {
              console.log(`Skipping non-laptop item: ${item.title}`)
              continue
            }

            // Prepare product data
            const productData = {
              asin: item.asin,
              title: item.title,
              current_price: currentPrice,
              original_price: originalPrice || currentPrice,
              rating: parseFloat(item.rating || '0'),
              rating_count: parseInt(item.reviews_count?.toString().replace(/,/g, '') || '0', 10),
              image_url: imageUrl,
              product_url: `https://www.amazon.com/dp/${item.asin}`,
              is_laptop: true,
              last_checked: new Date().toISOString()
            }

            console.log(`Saving laptop: ${productData.title} with image: ${productData.image_url}`)

            // Upsert the product into the database
            const { error } = await supabaseClient
              .from('products')
              .upsert(productData, { 
                onConflict: 'asin',
                ignoreDuplicates: false 
              })

            if (error) {
              console.error(`Error upserting product ${item.asin}:`, error)
              errors.push({ query, error: error.message })
            } else {
              console.log(`Successfully saved laptop: ${item.asin}`)
            }
          }

          // Add a small delay between batches
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Add a delay between queries
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`Error processing query "${query}":`, error)
        errors.push({ query, error: error.message })
        continue
      }
    }

    console.log(`Collection complete. Found ${foundAsins.size} unique laptops. ${errors.length} queries failed.`)
    if (errors.length > 0) {
      console.error('Errors during collection:', errors)
    }
  } catch (error) {
    console.error('Error in collection task:', error)
  }
}
