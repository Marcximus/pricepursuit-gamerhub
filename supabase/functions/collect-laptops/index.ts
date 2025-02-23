
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME');
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brands, pages_per_brand, batch_number, total_batches } = await req.json();
    console.log('Processing batch', batch_number, 'of', total_batches, 'for brands:', brands);

    if (!Array.isArray(brands) || brands.length === 0) {
      throw new Error('Invalid brands array');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const results = [];

    for (const brand of brands) {
      const sanitizedQuery = encodeURIComponent(`${brand} laptop`).replace(/%20/g, '+');

      const body = {
        source: "amazon_search",
        domain: "com",
        query: sanitizedQuery,
        start_page: 1, // Changed from 6 to 1 to improve initial data loading
        pages: pages_per_brand,
        geo_location: "90210",
        user_agent_type: "desktop",
        parse: true,
        context: [
          {
            key: "category",
            value: "Electronics>Computers & Accessories>Laptops"
          }
        ]
      };

      console.log('Sending request to Oxylabs:', {
        brand,
        query: sanitizedQuery,
        pages: pages_per_brand,
        start_page: 1
      });

      const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error(`Oxylabs API error for ${brand}:`, {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Oxylabs API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.results?.length || 0} results for ${brand}`);

      if (data.results) {
        results.push(...data.results);
      }
    }

    // Process and save results to Supabase
    for (const result of results) {
      if (!result.content?.results?.organic) continue;

      const products = result.content.results.organic;
      for (const product of products) {
        if (!product.asin) continue;

        try {
          const productData = {
            asin: product.asin,
            title: product.title || '',
            current_price: typeof product.price === 'number' ? product.price : null,
            original_price: typeof product.price_strikethrough === 'number' ? product.price_strikethrough : null,
            rating: typeof product.rating === 'number' ? product.rating : null,
            rating_count: typeof product.reviews_count === 'number' ? product.reviews_count : null,
            image_url: product.url_image || '',
            product_url: product.url || '',
            brand: brands[0],
            collection_status: 'completed',
            last_checked: new Date().toISOString(),
            last_collection_attempt: new Date().toISOString()
          };

          const { error } = await supabase
            .from('products')
            .upsert(productData, { 
              onConflict: 'asin',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error('Error saving product:', error);
            continue;
          }
        } catch (error) {
          console.error('Error processing product:', error);
          continue;
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
