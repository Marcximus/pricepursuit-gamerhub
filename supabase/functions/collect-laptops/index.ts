
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to normalize laptop titles for better comparison
function normalizeLaptopTitle(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')        // Normalize spaces
    .trim();
}

// Function to check if a title is too similar to existing ones
function isTitleTooSimilar(title: string, existingTitles: Set<string>): boolean {
  const normalizedNew = normalizeLaptopTitle(title);
  for (const existing of existingTitles) {
    const normalizedExisting = normalizeLaptopTitle(existing);
    // Check for high similarity (80% of words match)
    const newWords = new Set(normalizedNew.split(' '));
    const existingWords = new Set(normalizedExisting.split(' '));
    const commonWords = [...newWords].filter(word => existingWords.has(word));
    if (commonWords.length / Math.max(newWords.size, existingWords.size) > 0.8) {
      return true;
    }
  }
  return false;
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

    // Expanded search queries to cover more laptop categories and specifications
    const searchQueries = [
      "laptop computer",
      "gaming laptop",
      "business laptop",
      "student laptop",
      "ultrabook laptop",
      "2-in-1 laptop",
      "budget laptop",
      "premium laptop",
      "workstation laptop",
      "chromebook laptop",
      "MacBook laptop",
      "laptop 32GB RAM",
      "laptop 16GB RAM",
      "laptop 1TB SSD",
      "laptop RTX 4090",
      "laptop RTX 4080",
      "laptop RTX 4070",
      "laptop RTX 4060",
      "laptop RTX 4050",
      "laptop AMD Ryzen",
      "laptop Intel Core i9",
      "laptop Intel Core i7",
      "laptop Intel Core i5",
      "laptop 17 inch",
      "laptop 15.6 inch",
      "laptop 14 inch",
      "laptop 13 inch"
    ]

    EdgeRuntime.waitUntil((async () => {
      console.log('Starting laptop collection process...')
      const foundAsins = new Set()
      const foundTitles = new Set()
      let totalFound = 0
      let duplicatesSkipped = 0

      for (const query of searchQueries) {
        try {
          console.log(`Processing search query: ${query}`)
          
          // Get multiple pages of results for each query
          for (let page = 1; page <= 3; page++) {
            const payload = {
              source: 'amazon_search',
              query: query,
              domain: 'com',
              geo_location: 'United States',
              pages: page.toString(),
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
              console.error(`HTTP error for query "${query}" page ${page}:`, errorText)
              continue // Skip to next page/query on error
            }

            const data = await response.json()
            const results = [
              ...(data.results?.[0]?.content?.results?.organic || []),
              ...(data.results?.[0]?.content?.results?.paid || [])
            ]

            console.log(`Found ${results.length} results for query: ${query} (page ${page})`)

            for (const item of results) {
              if (!item.asin || !item.title || foundAsins.has(item.asin)) continue

              // Skip if not explicitly a laptop in title
              if (!item.title.toLowerCase().includes('laptop') && 
                  !item.title.toLowerCase().includes('notebook') &&
                  !item.title.toLowerCase().includes('macbook')) {
                continue
              }

              // Check for similar titles to avoid near-duplicates
              if (isTitleTooSimilar(item.title, foundTitles)) {
                duplicatesSkipped++
                continue
              }

              foundAsins.add(item.asin)
              foundTitles.add(item.title)
              totalFound++
              
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
      
      console.log(`Collection complete. Found ${totalFound} unique laptops, skipped ${duplicatesSkipped} potential duplicates`)
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
