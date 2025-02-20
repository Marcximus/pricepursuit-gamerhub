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

    console.log('Starting laptop collection with credentials check...');
    console.log('Credentials found:', { 
      username: username ? 'present' : 'missing',
      password: password ? 'present' : 'missing'
    });

    // Simple test request first
    const testQuery = {
      source: "amazon_product",
      query: "B0BS3RMPGD", // Using a known laptop ASIN for test
      parse: true,
      domain: "com"
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${username}:${password}`)
    };

    // Log EVERYTHING about the request
    console.log('Full Oxylabs request:', {
      url: 'https://realtime.oxylabs.io/v1/queries',
      method: 'POST',
      headers: headers,
      body: testQuery,
      encodedAuth: btoa(`${username}:${password}`),
      fullRequest: {
        method: 'POST',
        url: 'https://realtime.oxylabs.io/v1/queries',
        headers: headers,
        body: JSON.stringify(testQuery, null, 2)
      }
    });

    console.log('Raw request body being sent:', JSON.stringify(testQuery, null, 2));

    console.log('Testing authentication...');
    
    const testResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      body: JSON.stringify(testQuery),
      headers: headers
    });

    // Log complete response
    const responseText = await testResponse.text();
    console.log('Complete Oxylabs response:', {
      status: testResponse.status,
      statusText: testResponse.statusText,
      headers: Object.fromEntries(testResponse.headers.entries()),
      body: responseText
    });

    if (!testResponse.ok) {
      console.error('Auth test failed:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries()),
        response: responseText
      });
      throw new Error(`Authentication failed: ${testResponse.status} - ${responseText}`);
    }

    // Parse response if it's JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Parsed response data:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      console.log('Raw response:', responseText);
    }

    console.log('Authentication successful, proceeding with collection...');

    // Collect a single laptop for testing
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

    console.log('Storing test product in database...');

    // Store in Supabase
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

    console.log('Successfully stored test product');

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
