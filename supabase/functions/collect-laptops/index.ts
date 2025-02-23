
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')!;
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')!;
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchFromOxylabs(brand: string, page: number) {
  console.log(`[Oxylabs] Fetching data for ${brand} - page ${page}`);
  
  const payload = {
    source: "amazon_search",
    domain: "com",
    query: `${brand} laptop`,
    start_page: page,
    pages: 1,
    parse: true,
  };

  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`[Oxylabs] API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

async function processWithDeepseek(laptopData: any) {
  console.log('[DeepSeek] Processing laptop:', {
    title: laptopData.title,
    asin: laptopData.asin
  });

  const systemPrompt = `You are a laptop data processor. Extract and standardize laptop specifications from the provided data. 
Return ONLY valid JSON with the following structure, ensuring all values are properly formatted strings or numbers:

{
  "asin": "string",
  "processor": "string",
  "ram": "string",
  "storage": "string",
  "screen_size": "string",
  "screen_resolution": "string",
  "graphics": "string",
  "weight": "string",
  "battery_life": "string",
  "brand": "string",
  "model": "string"
}

Requirements:
- ASIN must match the input data exactly
- Extract specific numeric values where possible (e.g., "16GB" for RAM, "512GB" for storage)
- Standardize formats (e.g., "15.6 inches" for screen size)
- If a value cannot be determined, use null
- Ensure consistent formatting for each field
- The output MUST be valid JSON`;

  const userPrompt = `Process this laptop data and return standardized specifications:
Title: ${laptopData.title}
ASIN: ${laptopData.asin}
Description: ${laptopData.description || 'No description available'}`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`[DeepSeek] API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const processedData = JSON.parse(content);
      
      // Validate ASIN matches
      if (processedData.asin !== laptopData.asin) {
        console.error('[DeepSeek] ASIN mismatch:', {
          original: laptopData.asin,
          processed: processedData.asin
        });
        processedData.asin = laptopData.asin;
      }

      return processedData;
    } catch (parseError) {
      console.error('[DeepSeek] Error parsing response:', parseError);
      throw new Error('Invalid JSON response from DeepSeek');
    }
  } catch (error) {
    console.error('[DeepSeek] Processing error:', error);
    throw error;
  }
}

async function upsertProduct(supabase: any, rawData: any, processedData: any) {
  console.log('[Database] Upserting product:', {
    asin: rawData.asin,
    title: rawData.title
  });

  const productData = {
    asin: rawData.asin,
    title: rawData.title,
    current_price: typeof rawData.price === 'number' ? rawData.price : null,
    original_price: typeof rawData.price_strikethrough === 'number' ? rawData.price_strikethrough : null,
    rating: typeof rawData.rating === 'number' ? rawData.rating : null,
    rating_count: typeof rawData.reviews_count === 'number' ? rawData.reviews_count : null,
    image_url: rawData.url_image || null,
    product_url: rawData.url || null,
    is_laptop: true,
    brand: processedData.brand || rawData.manufacturer || '',
    collection_status: 'completed',
    last_checked: new Date().toISOString(),
    last_collection_attempt: new Date().toISOString(),
    // Add processed specifications
    processor: processedData.processor,
    ram: processedData.ram,
    storage: processedData.storage,
    screen_size: processedData.screen_size,
    screen_resolution: processedData.screen_resolution,
    graphics: processedData.graphics,
    weight: processedData.weight,
    battery_life: processedData.battery_life,
    model: processedData.model
  };

  const { error } = await supabase
    .from('products')
    .upsert([productData], {
      onConflict: 'asin',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('[Database] Error upserting product:', error);
    throw error;
  }

  console.log(`[Database] Successfully upserted product with ASIN: ${rawData.asin}`);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Function] Starting laptop collection process');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { brands, pages_per_brand } = await req.json();

    console.log(`[Function] Processing brands: ${brands.join(', ')}`);

    // Process each brand in the background
    const processAllBrands = async () => {
      for (const brand of brands) {
        console.log(`[Function] Processing brand: ${brand}`);
        
        try {
          for (let page = 1; page <= pages_per_brand; page++) {
            // Step 1: Fetch data from Oxylabs
            const oxylabsData = await fetchFromOxylabs(brand, page);
            
            if (!oxylabsData.results?.[0]?.content?.results) {
              console.warn(`[Oxylabs] No results found for ${brand} on page ${page}`);
              continue;
            }

            const results = [
              ...(oxylabsData.results[0].content.results.paid || []),
              ...(oxylabsData.results[0].content.results.organic || [])
            ];

            for (const result of results) {
              if (!result.asin) {
                console.warn('[Validation] Skipping result without ASIN');
                continue;
              }

              try {
                // Step 2: Process with DeepSeek
                const processedData = await processWithDeepseek(result);
                
                // Step 3: Update database
                await upsertProduct(supabase, result, processedData);
              } catch (productError) {
                console.error(`[Error] Processing product ${result.asin}:`, productError);
                continue;
              }
            }

            // Add a small delay between pages to prevent rate limiting
            if (page < pages_per_brand) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (brandError) {
          console.error(`[Error] Processing brand ${brand}:`, brandError);
          continue;
        }
      }
    };

    // Start processing in the background
    EdgeRuntime.waitUntil(processAllBrands());

    return new Response(
      JSON.stringify({ success: true, message: 'Collection process started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Error] Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
