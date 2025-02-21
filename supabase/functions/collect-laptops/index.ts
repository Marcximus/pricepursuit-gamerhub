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
    const { action } = await req.json()
    console.log('Received request with action:', action)

    if (action !== 'start') {
      throw new Error('Invalid action provided - expected "start"')
    }

    // Start the background task without waiting for it to complete
    EdgeRuntime.waitUntil(collectLaptopsTask())

    return new Response(
      JSON.stringify({
        success: true,
        message: "Laptop collection started in background. This may take several minutes to complete.",
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error initiating laptop collection:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function collectLaptopsTask() {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
  const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

  if (!oxyUsername || !oxyPassword) {
    throw new Error('Oxylabs credentials not configured')
  }

  // Broader search queries to capture more laptops
  const searchQueries = [
    // General laptop searches
    "laptop computer",
    "notebooks computers",
    "laptop",
    "portable computer",
    
    // Price ranges
    "laptops under 500",
    "laptops 500-1000",
    "laptops over 1000",
    "premium laptops",
    "budget laptops",
    
    // Popular brands
    "Dell laptop",
    "HP laptop",
    "Lenovo laptop",
    "ASUS laptop",
    "Acer laptop",
    "Apple MacBook",
    "MSI laptop",
    "Microsoft Surface laptop",
    "Razer laptop",
    "Samsung laptop",
    
    // Use cases
    "gaming laptop",
    "business laptop",
    "student laptop",
    "workstation laptop",
    "ultrabook",
    
    // Specifications
    "4K laptop",
    "touchscreen laptop",
    "16GB RAM laptop",
    "32GB RAM laptop",
    "1TB SSD laptop",
    "RTX laptop"
  ]

  console.log('Starting laptop collection process...')
  const foundAsins = new Set<string>()
  const errors: { query: string; error: string }[] = []
  let totalProcessed = 0
  let newLaptops = 0

  // Initial collection status update
  await supabaseClient
    .from('products')
    .update({ collection_status: 'in_progress', last_collection_attempt: new Date().toISOString() })
    .eq('is_laptop', true)

  for (const query of searchQueries) {
    console.log(`Processing search query: ${query}`)
    
    // Collect 10 pages of results per query for better coverage
    for (let page = 1; page <= 10; page++) {
      try {
        const payload = {
          source: 'amazon_search',
          query: query,
          domain: 'com',
          geo_location: 'United States',
          start_page: page.toString(),
          pages: '1',
          parse: true
        }

        console.log(`Making request to Oxylabs for query "${query}" page ${page}`)
        
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
        
        if (results.length === 0) {
          console.log(`No results found for query: ${query} page ${page}`)
          continue
        }

        console.log(`Found ${results.length} results for query: ${query} page ${page}`)
        totalProcessed += results.length

        // Process results in smaller batches
        const BATCH_SIZE = 10
        for (let i = 0; i < results.length; i += BATCH_SIZE) {
          const batch = results.slice(i, i + BATCH_SIZE)
          
          for (const item of batch) {
            if (!item.asin) continue

            // Skip if we've already processed this ASIN
            if (foundAsins.has(item.asin)) {
              console.log(`Skipping duplicate ASIN: ${item.asin}`)
              continue
            }

            // Check if it's a laptop based on multiple criteria
            const titleLower = (item.title || '').toLowerCase()
            const isLaptop = (
              titleLower.includes('laptop') ||
              titleLower.includes('notebook') ||
              titleLower.includes('macbook') ||
              titleLower.includes('chromebook') ||
              titleLower.includes('thinkpad') ||
              titleLower.includes('pavilion') ||
              titleLower.includes('inspiron') ||
              titleLower.includes('envy') ||
              titleLower.includes('zenbook') ||
              titleLower.includes('vivobook') ||
              titleLower.includes('ideapad')
            )
            
            if (!isLaptop) {
              console.log(`Skipping non-laptop item: ${item.title}`)
              continue
            }

            foundAsins.add(item.asin)
            
            const imageUrl = item.url_image || item.image
            const currentPrice = typeof item.price?.value === 'string' 
              ? parseFloat(item.price.value.replace(/[^0-9.]/g, '')) 
              : (typeof item.price?.value === 'number' ? item.price.value : null)
            
            const originalPrice = typeof item.price?.before_price === 'string'
              ? parseFloat(item.price.before_price.replace(/[^0-9.]/g, ''))
              : currentPrice

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
              last_checked: new Date().toISOString(),
              collection_status: 'collected'
            }

            // Try to insert first (this will fail if ASIN exists)
            const { error: insertError } = await supabaseClient
              .from('products')
              .insert([productData])

            if (insertError) {
              // If insert failed, update existing record
              const { error: updateError } = await supabaseClient
                .from('products')
                .update(productData)
                .eq('asin', item.asin)

              if (updateError) {
                console.error(`Error updating product ${item.asin}:`, updateError)
                errors.push({ query, error: updateError.message })
              }
            } else {
              newLaptops++
              console.log(`Successfully saved new laptop: ${item.asin}`)
            }
          }

          // Add a small delay between batches to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        }

      } catch (error) {
        console.error(`Error processing query "${query}" page ${page}:`, error)
        errors.push({ query, error: error.message })
        continue
      }

      // Add a delay between pages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Update final status
  await supabaseClient
    .from('products')
    .update({ 
      collection_status: 'completed',
      last_collection_attempt: new Date().toISOString()
    })
    .eq('is_laptop', true)
    .eq('collection_status', 'in_progress')

  console.log(`Collection complete. Processed ${totalProcessed} items, found ${foundAsins.size} unique laptops (${newLaptops} new). ${errors.length} errors occurred.`)
  if (errors.length > 0) {
    console.error('Errors during collection:', errors)
  }
}
