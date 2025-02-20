
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting laptop collection...');

    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch data from Oxylabs
    const body = {
      'source': 'amazon_search',
      'query': 'laptop',
      'parse': true,
      'context': [
        {'key': 'category', 'value': 'Electronics'},
        {'key': 'department', 'value': 'Computers & Tablets'}
      ]
    };

    console.log('Fetching data from Oxylabs...');
    
    const oxyResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      }
    });

    if (!oxyResponse.ok) {
      throw new Error(`Oxylabs API error: ${oxyResponse.statusText}`);
    }

    const oxyData = await oxyResponse.json();
    console.log(`Received ${oxyData.results?.length || 0} results from Oxylabs`);

    // Process and store each product
    const products = oxyData.results?.[0]?.content?.results?.map(item => ({
      asin: item.asin,
      title: item.title,
      current_price: parseFloat(item.price?.current) || null,
      original_price: parseFloat(item.price?.previous) || null,
      rating: parseFloat(item.rating) || null,
      rating_count: parseInt(item.rating_count) || null,
      image_url: item.image_url,
      product_url: item.url,
      is_laptop: true,
      // Extract specifications if available
      processor: item.specifications?.find(s => s.toLowerCase().includes('processor'))?.split(':')[1]?.trim(),
      ram: item.specifications?.find(s => s.toLowerCase().includes('ram'))?.split(':')[1]?.trim(),
      storage: item.specifications?.find(s => s.toLowerCase().includes('storage'))?.split(':')[1]?.trim(),
      screen_size: item.specifications?.find(s => s.toLowerCase().includes('screen'))?.split(':')[1]?.trim(),
      graphics: item.specifications?.find(s => s.toLowerCase().includes('graphics'))?.split(':')[1]?.trim(),
    })) || [];

    console.log(`Processed ${products.length} products, inserting into database...`);

    // Insert products into database
    const { data, error } = await supabase
      .from('products')
      .upsert(
        products,
        { 
          onConflict: 'asin',
          ignoreDuplicates: false
        }
      );

    if (error) {
      throw error;
    }

    console.log('Successfully collected and stored laptop data');

    return new Response(
      JSON.stringify({ success: true, count: products.length }),
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
