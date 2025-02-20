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

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

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

    // List of search queries for laptops
    const searchQueries = [
      "laptop", "notebook computer", "gaming laptop",
      "Dell laptop", "HP laptop", "Lenovo laptop", 
      "Apple MacBook", "ASUS laptop", "Acer laptop",
      "MSI gaming laptop", "Razer laptop", "Chromebook"
    ]

    console.log('Starting laptop collection process...')
    const foundAsins = new Set<string>()
    const maxPagesPerQuery = 2 // Limit to 2 pages per query

    for (const query of searchQueries) {
      console.log(`Searching for: ${query}`)
      
      const payload = {
        source: 'amazon_search',
        query: query,
        domain: 'com',
        geo_location: '90210',
        start_page: '1',
        pages: '2',
        parse: true
      }

      console.log('Making request to Oxylabs with payload:', JSON.stringify(payload))
      
      try {
        const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          console.error(`Error fetching results for ${query}: ${response.status}`)
          continue
        }

        const data = await response.json()
        console.log('Oxylabs response:', JSON.stringify(data))

        // Extract results from the response
        const results = data.results?.[0]?.content?.results?.organic || []
        
        if (results.length === 0) {
          console.log(`No results found for query: ${query}`)
          continue
        }

        console.log(`Found ${results.length} results for query: ${query}`)

        // Process and store each product
        for (const item of results) {
          if (!item.asin || foundAsins.has(item.asin)) continue

          foundAsins.add(item.asin)
          
          // Parse price values carefully
          const currentPrice = typeof item.price?.value === 'string' 
            ? parseFloat(item.price.value.replace(/[^0-9.]/g, '')) 
            : (typeof item.price?.value === 'number' ? item.price.value : 0)
          
          const originalPrice = typeof item.price?.before_price === 'string'
            ? parseFloat(item.price.before_price.replace(/[^0-9.]/g, ''))
            : (currentPrice || 0)

          // Check if it's actually a laptop based on title and category
          const isLaptop = (item.title || '').toLowerCase().includes('laptop') ||
                          (item.title || '').toLowerCase().includes('notebook') ||
                          (item.title || '').toLowerCase().includes('macbook')

          if (!isLaptop) {
            console.log(`Skipping non-laptop item: ${item.title}`)
            continue
          }

          // Prepare product data
          const productData = {
            asin: item.asin,
            title: item.title,
            current_price: currentPrice,
            original_price: originalPrice,
            rating: parseFloat(item.rating || '0'),
            rating_count: parseInt(item.rating_count?.replace(/,/g, '') || '0', 10),
            image_url: item.image,
            product_url: `https://www.amazon.com/dp/${item.asin}`,
            processor: extractProcessor(item.title || ''),
            ram: extractRAM(item.title || ''),
            storage: extractStorage(item.title || ''),
            screen_size: extractScreenSize(item.title || ''),
            graphics: extractGraphics(item.title || ''),
            is_laptop: true,
            processor_score: calculateProcessorScore(item.title || ''),
            benchmark_score: calculateBenchmarkScore(calculateProcessorScore(item.title || ''), item.title || ''),
            last_checked: new Date().toISOString()
          }

          console.log(`Processing laptop: ${productData.title}`)

          // Upsert the product into the database
          const { error } = await supabaseClient
            .from('products')
            .upsert(productData, { 
              onConflict: 'asin',
              ignoreDuplicates: false 
            })

          if (error) {
            console.error(`Error upserting product ${item.asin}:`, error)
          } else {
            console.log(`Successfully saved laptop: ${item.asin}`)
          }
        }

        // Add a delay between queries to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`Error processing query "${query}":`, error)
        continue
      }
    }

    return respond({
      success: true,
      message: `Collection complete. Found ${foundAsins.size} unique laptops.`
    })

  } catch (error) {
    console.error('Error in collect-laptops function:', error)
    return respond({ error: error.message }, 500)
  }
})

// Helper functions to extract and score laptop specifications
function extractProcessor(title: string): string {
  const processors = [
    'Intel Core i9', 'Intel Core i7', 'Intel Core i5', 'Intel Core i3',
    'AMD Ryzen 9', 'AMD Ryzen 7', 'AMD Ryzen 5', 'AMD Ryzen 3',
    'Apple M3', 'Apple M2', 'Apple M1'
  ]
  
  for (const processor of processors) {
    if (title.toLowerCase().includes(processor.toLowerCase())) {
      return processor
    }
  }
  return ''
}

function calculateProcessorScore(title: string): number {
  const processorScores: { [key: string]: number } = {
    'Intel Core i9': 95, 'Intel Core i7': 85, 'Intel Core i5': 75, 'Intel Core i3': 65,
    'AMD Ryzen 9': 95, 'AMD Ryzen 7': 85, 'AMD Ryzen 5': 75, 'AMD Ryzen 3': 65,
    'Apple M3': 98, 'Apple M2': 95, 'Apple M1': 90
  }

  const processor = extractProcessor(title)
  return processorScores[processor] || 50
}

function calculateBenchmarkScore(processorScore: number, title: string): number {
  // Start with processor score as base
  let score = processorScore

  // Adjust based on RAM
  const ram = extractRAM(title)
  const ramGB = parseInt(ram?.replace(/[^0-9]/g, '') || '0', 10)
  if (ramGB >= 32) score += 10
  else if (ramGB >= 16) score += 5
  else if (ramGB >= 8) score += 2

  // Adjust based on storage type
  const storage = extractStorage(title)
  if (storage?.toLowerCase().includes('ssd')) score += 5
  if (storage?.toLowerCase().includes('nvme')) score += 3

  // Adjust based on graphics
  const graphics = extractGraphics(title)
  if (graphics?.toLowerCase().includes('rtx')) score += 8
  else if (graphics?.toLowerCase().includes('gtx')) score += 5
  else if (graphics?.toLowerCase().includes('radeon')) score += 4

  // Normalize score to 0-100 range
  return Math.min(Math.max(score, 0), 100)
}

function extractRAM(title: string): string {
  const ramMatch = title.match(/(\d+)\s*GB RAM/i)
  return ramMatch ? `${ramMatch[1]}GB RAM` : ''
}

function extractStorage(title: string): string {
  const storageMatch = title.match(/(\d+)\s*(TB|GB)\s*(SSD|HDD|NVME)/i)
  return storageMatch ? `${storageMatch[1]}${storageMatch[2]} ${storageMatch[3]}` : ''
}

function extractScreenSize(title: string): string {
  const sizeMatch = title.match(/(\d+\.?\d*)"/)
  return sizeMatch ? `${sizeMatch[1]} inches` : ''
}

function extractGraphics(title: string): string {
  const graphics = [
    'NVIDIA RTX', 'NVIDIA GTX', 'AMD Radeon',
    'Intel Iris', 'Intel UHD', 'Apple GPU'
  ]
  
  for (const gpu of graphics) {
    if (title.toLowerCase().includes(gpu.toLowerCase())) {
      return gpu
    }
  }
  return ''
}
