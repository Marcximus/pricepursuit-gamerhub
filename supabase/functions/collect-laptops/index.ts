
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
      throw new Error('Oxylabs credentials not configured');
    }

    console.log('Starting laptop collection with Oxylabs...');

    // Test the credentials first with a single product
    const testBody = {
      'source': 'amazon_product',
      'url': 'https://www.amazon.com/dp/B0BS3RMPGD',
      'parse': true,
      'domain': 'com',
      'geo_location': 'United States'
    };

    const testResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      body: JSON.stringify(testBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      }
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('Authentication test failed:', testResponse.status, errorText);
      throw new Error(`Oxylabs authentication failed: ${testResponse.status}`);
    }

    console.log('Authentication successful, proceeding with laptop collection...');
    
    const searchQuery = {
      'source': 'amazon_search',
      'query': 'laptop',
      'parse': true,
      'domain': 'com',
      'geo_location': 'United States',
      'context': [
        {'key': 'category', 'value': 'Electronics'},
        {'key': 'department', 'value': 'Computers & Tablets'}
      ],
      'start_page': 1,
      'pages': 1
    };

    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      body: JSON.stringify(searchQuery),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search query failed:', response.status, errorText);
      throw new Error(`Failed to fetch laptops: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully received data from Oxylabs');

    if (!data.results || !data.results[0]?.content?.results) {
      throw new Error('Invalid response format from Oxylabs');
    }

    const products = data.results[0].content.results.map(item => ({
      asin: item.asin,
      title: item.title,
      current_price: parseFloat(item.price?.current) || null,
      original_price: parseFloat(item.price?.previous) || null,
      rating: parseFloat(item.rating) || null,
      rating_count: parseInt(item.rating_count?.replace(/,/g, '')) || null,
      image_url: item.image,
      product_url: item.url,
      is_laptop: true,
      processor: item.specifications?.find(s => s.toLowerCase().includes('processor'))?.split(':')[1]?.trim(),
      ram: item.specifications?.find(s => s.toLowerCase().includes('ram'))?.split(':')[1]?.trim(),
      storage: item.specifications?.find(s => s.toLowerCase().includes('storage'))?.split(':')[1]?.trim(),
      screen_size: item.specifications?.find(s => s.toLowerCase().includes('screen size'))?.split(':')[1]?.trim(),
      graphics: item.specifications?.find(s => s.toLowerCase().includes('graphics'))?.split(':')[1]?.trim(),
      last_checked: new Date().toISOString()
    }));

    console.log(`Found ${products.length} laptops`);

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
      console.error('Error storing products:', upsertError);
      throw upsertError;
    }

    console.log('Successfully stored laptops in database');

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
