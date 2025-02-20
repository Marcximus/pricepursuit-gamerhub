
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { asin } = await req.json();
    
    if (!asin) {
      throw new Error('ASIN is required');
    }

    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }

    console.log(`Fetching product data for ASIN: ${asin}`);

    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      },
      body: JSON.stringify({
        source: 'amazon_product',
        query: asin,
        geo_location: '90210',
        parse: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Oxylabs API error:', errorText);
      throw new Error(`Failed to fetch from Oxylabs: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.results?.[0]?.content) {
      console.error('No content in Oxylabs response:', data);
      throw new Error('No product data found');
    }

    const product = data.results[0].content;
    
    const formattedProduct = {
      id: asin,
      asin: asin,
      title: product.title,
      current_price: product.price?.current_price || product.price?.current,
      original_price: product.price?.previous_price || product.price?.previous || product.price?.current,
      rating: product.rating,
      rating_count: product.ratings_total,
      image_url: product.images?.[0],
      product_url: product.url,
      last_checked: new Date().toISOString()
    };

    console.log('Successfully fetched product data:', formattedProduct);

    return new Response(
      JSON.stringify(formattedProduct),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-product function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch product data' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
