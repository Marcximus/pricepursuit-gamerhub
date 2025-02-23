
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')!;
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')!;
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CollectLaptopsRequest {
  brands: string[];
  pages_per_brand: number;
  batch_number: number;
  total_batches: number;
}

async function fetchFromOxylabs(brand: string, page: number) {
  console.log(`Fetching data for ${brand} - page ${page}`);
  
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
    throw new Error(`Oxylabs API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

async function processWithDeepseek(laptopData: any) {
  console.log('Processing laptop with DeepSeek:', {
    title: laptopData.title,
    asin: laptopData.asin
  });

  const systemPrompt = `You are a laptop data processor. Extract and standardize laptop specifications from the provided data. Return ONLY valid JSON with the following structure, ensuring all values are properly formatted strings or numbers. Include the ASIN in your response:

  {
    "asin": "string",
    "processor": "string",
    "ram": "string",
    "storage": "string",
    "screen_size": "string",
    "screen_resolution": "string",
    "graphics": "string",
    "weight": "string",
    "battery_life": "string"
  }

  If a value cannot be determined, use null. Ensure the output is valid JSON.`;

  const userPrompt = `Process this laptop data and return standardized specifications:
  Title: ${laptopData.title}
  ASIN: ${laptopData.asin}`;

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
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  let processedData;

  try {
    const content = data.choices[0].message.content;
    processedData = JSON.parse(content);
    
    // Validate ASIN matches
    if (processedData.asin !== laptopData.asin) {
      console.error('ASIN mismatch:', {
        original: laptopData.asin,
        processed: processedData.asin
      });
      processedData.asin = laptopData.asin; // Ensure we keep the original ASIN
    }
  } catch (error) {
    console.error('Error parsing DeepSeek response:', error);
    throw new Error('Invalid JSON response from DeepSeek');
  }

  return processedData;
}

async function upsertProduct(supabase: any, rawData: any, processedData: any) {
  const productData = {
    asin: rawData.asin,
    title: rawData.title || '',
    current_price: typeof rawData.price === 'number' ? rawData.price : null,
    original_price: typeof rawData.price_strikethrough === 'number' ? rawData.price_strikethrough : null,
    rating: typeof rawData.rating === 'number' ? rawData.rating : null,
    rating_count: typeof rawData.reviews_count === 'number' ? rawData.reviews_count : null,
    image_url: rawData.url_image || '',
    product_url: rawData.url || '',
    is_laptop: true,
    brand: rawData.manufacturer || '',
    collection_status: 'completed',
    last_checked: new Date().toISOString(),
    last_collection_attempt: new Date().toISOString(),
    // Add processed data
    processor: processedData.processor,
    ram: processedData.ram,
    storage: processedData.storage,
    screen_size: processedData.screen_size,
    screen_resolution: processedData.screen_resolution,
    graphics: processedData.graphics,
    weight: processedData.weight,
    battery_life: processedData.battery_life
  };

  const { error } = await supabase
    .from('products')
    .upsert([productData], {
      onConflict: 'asin',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Error upserting product:', error);
    throw error;
  }

  console.log(`Successfully upserted product with ASIN: ${rawData.asin}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { brands, pages_per_brand } = await req.json() as CollectLaptopsRequest;

    console.log(`Starting collection for brands: ${brands.join(', ')}`);

    for (const brand of brands) {
      console.log(`Processing brand: ${brand}`);
      
      try {
        for (let page = 1; page <= pages_per_brand; page++) {
          const oxylabsData = await fetchFromOxylabs(brand, page);
          
          if (!oxylabsData.results?.[0]?.content?.results) {
            console.warn(`No results found for ${brand} on page ${page}`);
            continue;
          }

          const results = [
            ...(oxylabsData.results[0].content.results.paid || []),
            ...(oxylabsData.results[0].content.results.organic || [])
          ];

          for (const result of results) {
            if (!result.asin) {
              console.warn('Skipping result without ASIN');
              continue;
            }

            try {
              console.log(`Processing ASIN: ${result.asin}`);
              const processedData = await processWithDeepseek(result);
              await upsertProduct(supabase, result, processedData);
            } catch (productError) {
              console.error(`Error processing product ${result.asin}:`, productError);
              continue;
            }
          }
        }

      } catch (brandError) {
        console.error(`Error processing brand ${brand}:`, brandError);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
