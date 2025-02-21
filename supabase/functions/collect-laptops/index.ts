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

// Enhanced specification extraction functions
function extractProcessor(title: string): string {
  const processors = [
    // Intel
    { pattern: /Intel[\s-]Core[\s-]i\d+[\s-](\d{4,5}[A-Z]*)/i, brand: 'Intel Core' },
    { pattern: /Intel[\s-]Core[\s-]i(\d)[,-](\d{4,5}[A-Z]*)/i, brand: 'Intel Core' },
    { pattern: /Intel[\s-]Core[\s-]i(\d)/i, brand: 'Intel Core' },
    { pattern: /Intel[\s-]Celeron[\s-]([A-Z0-9-]+)/i, brand: 'Intel Celeron' },
    { pattern: /Intel[\s-]Pentium[\s-]([A-Z0-9-]+)/i, brand: 'Intel Pentium' },
    // AMD
    { pattern: /AMD[\s-]Ryzen[\s-]\d+[A-Z]*[\s-](\d{4,5}[A-Z]*)/i, brand: 'AMD Ryzen' },
    { pattern: /AMD[\s-]Ryzen[\s-](\d)/i, brand: 'AMD Ryzen' },
    { pattern: /AMD[\s-]([A-Z]\d-\d{4}[A-Z]*)/i, brand: 'AMD' },
    // Apple
    { pattern: /Apple[\s-]M(\d)[\s-](?:Pro|Max|Ultra)?/i, brand: 'Apple Silicon' },
    // MediaTek
    { pattern: /MediaTek[\s-]([A-Za-z0-9]+)/i, brand: 'MediaTek' },
    // Qualcomm
    { pattern: /Snapdragon[\s-]([A-Za-z0-9]+)/i, brand: 'Qualcomm' }
  ];

  for (const { pattern, brand } of processors) {
    const match = title.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  return '';
}

function extractRAM(title: string): string {
  const ramPattern = /(\d+)\s*GB\s*(DDR\d[LX]?)?\s*(RAM|Memory)/i;
  const match = title.match(ramPattern);
  return match ? `${match[1]}GB${match[2] ? ` ${match[2]}` : ''}` : '';
}

function extractStorage(title: string): string {
  const storagePatterns = [
    /(\d+)\s*TB\s*(SSD|HDD|Storage|eMMC)/i,
    /(\d+)\s*GB\s*(SSD|HDD|Storage|eMMC)/i,
    /(\d+)\s*(SSD|HDD|Storage|eMMC)/i
  ];

  for (const pattern of storagePatterns) {
    const match = title.match(pattern);
    if (match) {
      return `${match[1]}${match[1].match(/TB|GB/i) ? '' : 'GB'} ${match[2]}`.trim();
    }
  }
  return '';
}

function extractScreenSize(title: string): string {
  const screenPattern = /(\d+\.?\d?)[\s-]?(?:inch|"|\'\'|\s*display|\s*screen)/i;
  const match = title.match(screenPattern);
  return match ? `${match[1]} inches` : '';
}

function extractScreenResolution(title: string): string {
  const resolutions = {
    '4K': /4K|3840x2160|2160p/i,
    'QHD': /QHD|2K|2560x1440|1440p/i,
    'FHD': /FHD|1920x1080|1080p/i,
    'HD': /HD|1366x768|720p/i
  };

  for (const [key, pattern] of Object.entries(resolutions)) {
    if (pattern.test(title)) {
      return key;
    }
  }
  return '';
}

function extractGraphics(title: string): string {
  const graphicsPatterns = [
    // NVIDIA
    { pattern: /NVIDIA[\s-]GeForce[\s-]RTX[\s-](\d{4}[A-Z]*(?:\s*Ti)?)/i, brand: 'NVIDIA GeForce RTX' },
    { pattern: /NVIDIA[\s-]GeForce[\s-]GTX[\s-](\d{4}[A-Z]*(?:\s*Ti)?)/i, brand: 'NVIDIA GeForce GTX' },
    // AMD
    { pattern: /AMD[\s-]Radeon[\s-](?:RX\s*)?(\d{4}[A-Z]*)/i, brand: 'AMD Radeon' },
    // Intel
    { pattern: /Intel[\s-]Iris[\s-]Xe/i, brand: 'Intel Iris Xe' },
    { pattern: /Intel[\s-]UHD[\s-]Graphics/i, brand: 'Intel UHD' },
    // Apple
    { pattern: /Apple[\s-](\d+)[-\s]core[\s-]GPU/i, brand: 'Apple' }
  ];

  for (const { pattern, brand } of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  return '';
}

function calculateProcessorScore(processor: string): number {
  const scores: { [key: string]: number } = {
    'Intel Core i9': 95,
    'Intel Core i7': 85,
    'Intel Core i5': 75,
    'Intel Core i3': 65,
    'AMD Ryzen 9': 95,
    'AMD Ryzen 7': 85,
    'AMD Ryzen 5': 75,
    'AMD Ryzen 3': 65,
    'Apple M3': 98,
    'Apple M2': 95,
    'Apple M1': 90,
    'Intel Celeron': 40,
    'Intel Pentium': 50,
    'MediaTek': 45,
    'Snapdragon': 55
  };

  for (const [key, score] of Object.entries(scores)) {
    if (processor.includes(key)) {
      // Add bonus points for newer generations
      const genMatch = processor.match(/(\d{4})/);
      if (genMatch) {
        const generation = parseInt(genMatch[1]);
        return Math.min(score + (generation > 10000 ? 5 : 0), 100);
      }
      return score;
    }
  }
  return 50;
}

function calculateBenchmarkScore(processorScore: number, title: string): number {
  let score = processorScore;

  // RAM scoring
  const ramMatch = extractRAM(title).match(/(\d+)GB/i);
  if (ramMatch) {
    const ramSize = parseInt(ramMatch[1]);
    if (ramSize >= 32) score += 10;
    else if (ramSize >= 16) score += 7;
    else if (ramSize >= 8) score += 5;
    else score += 2;
  }

  // Storage scoring
  const storage = extractStorage(title).toLowerCase();
  if (storage.includes('ssd')) {
    if (storage.includes('nvme')) score += 8;
    else score += 5;
  } else if (storage.includes('hdd')) {
    score += 2;
  }

  // Graphics scoring
  const graphics = extractGraphics(title).toLowerCase();
  if (graphics.includes('rtx')) score += 10;
  else if (graphics.includes('gtx')) score += 8;
  else if (graphics.includes('radeon')) score += 7;
  else if (graphics.includes('iris xe')) score += 5;
  else if (graphics.includes('uhd')) score += 3;

  // Screen resolution scoring
  const resolution = extractScreenResolution(title).toLowerCase();
  if (resolution.includes('4k')) score += 5;
  else if (resolution.includes('qhd')) score += 4;
  else if (resolution.includes('fhd')) score += 3;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

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
      
      // Major brands
      "Lenovo laptop",
      "HP laptop",
      "Dell laptop",
      "Apple MacBook",
      "Acer laptop",
      "ASUS laptop",
      "Microsoft Surface laptop",
      "Samsung laptop",
      "MSI laptop",
      "Razer laptop",
      "LG gram laptop",
      "Huawei laptop",
      "Dynabook laptop",
      "Gigabyte laptop",
      "Fujitsu laptop",
      "Panasonic laptop",
      "VAIO laptop",
      "Xiaomi laptop",
      
      // Use cases and categories
      "gaming laptop",
      "business laptop",
      "student laptop",
      "2-in-1 laptop",
      "ultrabook",
      "workstation laptop",
      
      // Price ranges
      "premium laptop",
      "budget laptop",
      
      // Specific popular models
      "ThinkPad laptop",
      "XPS laptop",
      "Spectre laptop",
      "ROG laptop",
      "Predator laptop",
      "ZenBook laptop",
      "IdeaPad laptop",
      "Chromebook",
      "MacBook Pro",
      "MacBook Air"
    ]

    console.log('Starting laptop collection process in background...')
    const foundAsins = new Set<string>()
    const errors = []

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
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json()
        console.log(`Received response for query "${query}"`)

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
          
          const currentPrice = typeof item.price?.value === 'string' 
            ? parseFloat(item.price.value.replace(/[^0-9.]/g, '')) 
            : (typeof item.price?.value === 'number' ? item.price.value : 0)
          
          const originalPrice = typeof item.price?.before_price === 'string'
            ? parseFloat(item.price.before_price.replace(/[^0-9.]/g, ''))
            : (currentPrice || 0)

          // Check if it's actually a laptop
          const isLaptop = (item.title || '').toLowerCase().includes('laptop') ||
                          (item.title || '').toLowerCase().includes('notebook') ||
                          (item.title || '').toLowerCase().includes('macbook') ||
                          (item.title || '').toLowerCase().includes('chromebook') ||
                          (item.title || '').toLowerCase().includes('2 in 1') ||
                          (item.title || '').toLowerCase().includes('2-in-1')

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
        errors.push({ query, error: error.message })
        continue
      }
    }

    console.log(`Background collection complete. Found ${foundAsins.size} unique laptops. ${errors.length} queries failed.`)
  } catch (error) {
    console.error('Error in background collection task:', error)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action } = await req.json();
    console.log('Received request with action:', action);

    if (action !== 'collect') {
      throw new Error('Invalid action provided');
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
