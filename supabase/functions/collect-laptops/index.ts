
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const extractSpecsFromAmazon = (specifications: string[] = []) => {
  const specs: Record<string, string | undefined> = {};
  
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
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }

    console.log('Starting laptop collection process...');
    
    // First do a search to get laptop ASINs
    const searchQuery = {
      source: 'amazon_search',
      query: 'laptop computers',
      parse: true,
      domain: 'com',
      geo_location: '90210',
      context: [
        { key: 'category', value: 'Electronics' },
        { key: 'department', value: 'Computers & Tablets' }
      ],
      start_page: 1,
      pages: 2
    };

    const searchResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      body: JSON.stringify(searchQuery),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Search request failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('Search completed successfully');

    if (!searchData.results?.[0]?.content?.results) {
      throw new Error('Invalid search response format');
    }

    // Extract ASINs from search results
    const asins = searchData.results[0].content.results
      .filter(item => item.asin)
      .map(item => item.asin);

    console.log(`Found ${asins.length} laptop ASINs`);

    // Get detailed product information for each ASIN
    const products = [];
    for (const asin of asins.slice(0, 10)) { // Limit to 10 products for testing
      console.log(`Fetching details for ASIN: ${asin}`);
      
      const productQuery = {
        source: 'amazon_product',
        query: asin,
        parse: true,
        domain: 'com',
        geo_location: '90210'
      };

      const productResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        body: JSON.stringify(productQuery),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        }
      });

      if (!productResponse.ok) {
        console.error(`Failed to fetch product ${asin}: ${productResponse.status}`);
        continue;
      }

      const productData = await productResponse.json();
      const item = productData.results?.[0]?.content;
      
      if (!item) {
        console.error(`No data found for product ${asin}`);
        continue;
      }

      const specs = extractSpecsFromAmazon(item.specifications || []);
      
      products.push({
        asin: item.asin,
        title: item.title,
        current_price: parseFloat(item.price?.current?.replace(/[^0-9.]/g, '')) || null,
        original_price: parseFloat(item.price?.previous?.replace(/[^0-9.]/g, '')) || null,
        rating: parseFloat(item.rating) || null,
        rating_count: parseInt(item.rating_count?.replace(/[^0-9]/g, '') || '0'),
        image_url: item.image_url || item.images?.[0],
        product_url: item.url,
        is_laptop: true,
        processor: specs.processor,
        ram: specs.ram,
        storage: specs.storage,
        screen_size: specs.screen_size,
        graphics: specs.graphics,
        last_checked: new Date().toISOString()
      });

      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Successfully collected ${products.length} laptop details`);

    // Store in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: upsertError } = await supabase
      .from('products')
      .upsert(
        products,
        { 
          onConflict: 'asin',
          ignoreDuplicates: false
        }
      );

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: products.length,
        message: `Successfully collected ${products.length} laptops`
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
