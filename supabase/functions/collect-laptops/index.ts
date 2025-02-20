
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const searchTerms = [
  'laptop',
  'notebook computer',
  'gaming laptop',
  'business laptop',
  'MacBook'
];

const extractSpecs = (specifications: string[] = []) => {
  const specs: Record<string, string | undefined> = {
    processor: undefined,
    ram: undefined,
    storage: undefined,
    screen_size: undefined,
    screen_resolution: undefined,
    graphics: undefined
  };

  specifications.forEach(spec => {
    const lowerSpec = spec.toLowerCase();
    if (lowerSpec.includes('processor') || lowerSpec.includes('cpu')) {
      specs.processor = spec.split(':')[1]?.trim();
    } else if (lowerSpec.includes('ram') || lowerSpec.includes('memory')) {
      specs.ram = spec.split(':')[1]?.trim();
    } else if (lowerSpec.includes('storage') || lowerSpec.includes('ssd') || lowerSpec.includes('hdd')) {
      specs.storage = spec.split(':')[1]?.trim();
    } else if (lowerSpec.includes('screen size')) {
      specs.screen_size = spec.split(':')[1]?.trim();
    } else if (lowerSpec.includes('resolution')) {
      specs.screen_resolution = spec.split(':')[1]?.trim();
    } else if (lowerSpec.includes('graphics') || lowerSpec.includes('gpu')) {
      specs.graphics = spec.split(':')[1]?.trim();
    }
  });

  return specs;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting comprehensive laptop collection...');
    
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let allProducts = [];

    // Collect data for each search term
    for (const searchTerm of searchTerms) {
      console.log(`Fetching data for search term: ${searchTerm}`);
      
      const body = {
        'source': 'amazon_search',
        'query': searchTerm,
        'parse': true,
        'domain': 'com',
        'geo_location': 'United States',
        'context': [
          {'key': 'category', 'value': 'Electronics'},
          {'key': 'department', 'value': 'Computers & Tablets'}
        ],
        'pages': 5 // Fetch 5 pages per term to get a good variety
      };

      const oxyResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        }
      });

      if (!oxyResponse.ok) {
        console.error(`Error fetching ${searchTerm}:`, oxyResponse.statusText);
        continue;
      }

      const oxyData = await oxyResponse.json();
      console.log(`Received ${oxyData.results?.length || 0} results for ${searchTerm}`);

      const products = oxyData.results?.[0]?.content?.results?.map(item => {
        const specs = extractSpecs(item.specifications);
        return {
          asin: item.asin,
          title: item.title,
          current_price: parseFloat(item.price?.current) || null,
          original_price: parseFloat(item.price?.previous) || null,
          rating: parseFloat(item.rating) || null,
          rating_count: parseInt(item.rating_count?.replace(/,/g, '')) || null,
          image_url: item.image_url,
          product_url: item.url,
          is_laptop: true,
          processor: specs.processor,
          ram: specs.ram,
          storage: specs.storage,
          screen_size: specs.screen_size,
          screen_resolution: specs.screen_resolution,
          graphics: specs.graphics,
          last_checked: new Date().toISOString()
        };
      }) || [];

      allProducts = [...allProducts, ...products];

      // Sleep for 1 second between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Total unique products found: ${allProducts.length}`);

    // Filter out duplicates based on ASIN
    const uniqueProducts = allProducts.filter((product, index, self) =>
      index === self.findIndex((p) => p.asin === product.asin)
    );

    console.log(`After removing duplicates: ${uniqueProducts.length} products`);

    // Insert products into database
    if (uniqueProducts.length > 0) {
      const { data, error } = await supabase
        .from('products')
        .upsert(
          uniqueProducts,
          { 
            onConflict: 'asin',
            ignoreDuplicates: false
          }
        );

      if (error) {
        throw error;
      }

      console.log('Successfully stored laptop data');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: uniqueProducts.length,
        message: `Successfully collected ${uniqueProducts.length} unique laptops`
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
      JSON.stringify({ error: error.message }),
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
