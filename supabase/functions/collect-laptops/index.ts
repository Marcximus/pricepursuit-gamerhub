
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LAPTOP_SEARCH_QUERIES = [
  'laptop',
  'gaming laptop',
  'business laptop',
  'ultrabook'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!username || !password) {
      console.error('Missing Oxylabs credentials');
      throw new Error('Oxylabs credentials not configured');
    }

    console.log('Starting laptop collection process...');
    const collectedAsins = new Set<string>();
    const laptops = [];

    for (const searchQuery of LAPTOP_SEARCH_QUERIES) {
      console.log(`Searching for: ${searchQuery}`);
      
      const searchBody = {
        'source': 'amazon_search',
        'query': searchQuery,
        'parse': true,
        'domain': 'com',
        'pages': 2, // Collect from first 2 pages
        'context': [
          { 'key': 'category_id', 'value': '565108' } // Amazon's Laptop category ID
        ]
      };

      const searchResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        body: JSON.stringify(searchBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        }
      });

      const searchData = await searchResponse.json();
      
      if (!searchResponse.ok) {
        console.error('Search failed:', searchData);
        continue;
      }

      const results = searchData.results?.[0]?.content?.results || [];
      
      // Collect ASINs from search results
      for (const result of results) {
        if (result.asin && !collectedAsins.has(result.asin)) {
          collectedAsins.add(result.asin);
          
          // Get detailed product information
          const productBody = {
            'source': 'amazon_product',
            'query': result.asin,
            'parse': true,
            'domain': 'com'
          };

          console.log(`Fetching details for ASIN: ${result.asin}`);
          
          const productResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
            method: 'POST',
            body: JSON.stringify(productBody),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(`${username}:${password}`)
            }
          });

          const productData = await productResponse.json();
          
          if (!productResponse.ok) {
            console.error(`Failed to fetch product ${result.asin}:`, productData);
            continue;
          }

          const product = productData.results?.[0]?.content;
          
          if (product) {
            // Extract specifications from product description and features
            const specs = extractSpecs(product.description || '', product.features || []);
            
            laptops.push({
              asin: result.asin,
              title: product.title,
              current_price: parseFloat(product.price?.current_price) || null,
              original_price: parseFloat(product.price?.previous_price) || parseFloat(product.price?.current_price) || null,
              rating: parseFloat(product.rating) || null,
              rating_count: parseInt(product.rating_count) || null,
              image_url: product.images?.[0] || null,
              product_url: `https://www.amazon.com/dp/${result.asin}`,
              description: product.description || null,
              processor: specs.processor,
              ram: specs.ram,
              storage: specs.storage,
              graphics: specs.graphics,
              screen_size: specs.screenSize,
              weight: specs.weight,
              battery_life: specs.batteryLife,
              is_laptop: true,
              last_checked: new Date().toISOString()
            });
          }
        }
      }
    }

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Saving ${laptops.length} laptops to database...`);

    for (const laptop of laptops) {
      const { error: upsertError } = await supabase
        .from('products')
        .upsert(
          [laptop],
          { 
            onConflict: 'asin',
            ignoreDuplicates: false
          }
        );

      if (upsertError) {
        console.error('Database error:', upsertError);
        throw upsertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully collected ${laptops.length} laptops`,
        laptops_collected: laptops.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in collect-laptops function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});

// Helper function to extract specifications from product description and features
function extractSpecs(description: string, features: string[]): {
  processor?: string;
  ram?: string;
  storage?: string;
  graphics?: string;
  screenSize?: string;
  weight?: string;
  batteryLife?: string;
} {
  const specs = {
    processor: undefined,
    ram: undefined,
    storage: undefined,
    graphics: undefined,
    screenSize: undefined,
    weight: undefined,
    batteryLife: undefined
  };

  const allText = [description, ...features].join(' ');

  // Processor
  const processorMatch = allText.match(/(?:Intel|AMD|Apple M[\d]|Ryzen|Core i[3579]|Snapdragon)[\w\s-]+(processor|CPU)/i);
  if (processorMatch) specs.processor = processorMatch[0].trim();

  // RAM
  const ramMatch = allText.match(/(\d+)\s*GB\s*(DDR[34]|LPDDR[345]|Unified)?\s*(RAM|Memory)/i);
  if (ramMatch) specs.ram = ramMatch[0].trim();

  // Storage
  const storageMatch = allText.match(/(\d+)\s*(GB|TB)\s*(SSD|HDD|PCIe|NVMe)/i);
  if (storageMatch) specs.storage = storageMatch[0].trim();

  // Graphics
  const graphicsMatch = allText.match(/(?:NVIDIA|AMD|Intel|Radeon|GeForce|RTX|GTX|Iris)[\w\s-]+(Graphics|GPU)/i);
  if (graphicsMatch) specs.graphics = graphicsMatch[0].trim();

  // Screen Size
  const screenMatch = allText.match(/(\d+(\.\d+)?)\s*-?inch/i);
  if (screenMatch) specs.screenSize = screenMatch[0].trim();

  // Weight
  const weightMatch = allText.match(/(\d+(\.\d+)?)\s*(pounds|lbs|kg)/i);
  if (weightMatch) specs.weight = weightMatch[0].trim();

  // Battery Life
  const batteryMatch = allText.match(/(?:up to\s)?(\d+)\s*(?:hours?|hrs?)\s*(?:of\s*)?(?:battery|charge)/i);
  if (batteryMatch) specs.batteryLife = batteryMatch[0].trim();

  return specs;
}
