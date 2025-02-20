import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Log the full request as it would appear in a standalone script
    console.log('Full request as standalone script:');
    console.log(`
import fetch from 'node-fetch';

const username = '${username}';
const password = '${password}';

const body = {
  'source': 'amazon_product',
  'query': 'B0BS3RMPGD',
  'parse': true,
  'domain': 'com'
};

const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
  method: 'POST',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('${username}:${password}')
  }
});

console.log(await response.json());
    `);

    // Execute the actual request
    const testQuery = {
      source: "amazon_product",
      query: "B0BS3RMPGD",
      parse: true,
      domain: "com"
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${username}:${password}`)
    };

    console.log('Testing authentication...');
    
    const testResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      body: JSON.stringify(testQuery),
      headers: headers
    });

    // Log complete response
    const responseText = await testResponse.text();
    console.log('Response:', responseText);

    if (!testResponse.ok) {
      throw new Error(`Authentication failed: ${testResponse.status} - ${responseText}`);
    }

    // Rest of the function...
    const sampleProduct = {
      asin: "B0BS3RMPGD",
      title: "HP 2023 15.6\" HD Laptop",
      current_price: 399.99,
      original_price: 499.99,
      rating: 4.5,
      rating_count: 1250,
      image_url: "https://m.media-amazon.com/images/I/71RD3vsjIYL._AC_SL1500_.jpg",
      product_url: "https://www.amazon.com/dp/B0BS3RMPGD",
      is_laptop: true,
      processor: "Intel Core i3-1115G4",
      ram: "8GB DDR4",
      storage: "256GB SSD",
      screen_size: "15.6 inches",
      graphics: "Intel UHD Graphics",
      last_checked: new Date().toISOString()
    };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: upsertError } = await supabase
      .from('products')
      .upsert(
        [sampleProduct],
        { 
          onConflict: 'asin',
          ignoreDuplicates: false
        }
      );

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully collected test laptop data',
        details: 'Running in test mode with sample data'
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
        details: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error
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
