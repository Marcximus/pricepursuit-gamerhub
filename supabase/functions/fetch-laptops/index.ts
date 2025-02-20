
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LAPTOP_ASINS = [
  "B07FZ8S74R", // Your requested ASIN
  "B0BSHF7WHH", // Dell XPS
  "B09PTVP3RT", // MacBook Pro
  "B09RBGCX3D", // Lenovo ThinkPad
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }

    // Fetch data for each ASIN in parallel
    const laptopPromises = LAPTOP_ASINS.map(async (asin) => {
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
        console.error(`Failed to fetch data for ASIN ${asin}:`, await response.text());
        return null;
      }

      const data = await response.json();
      
      if (!data.results?.[0]?.content) {
        console.error(`No content found for ASIN ${asin}`);
        return null;
      }

      const product = data.results[0].content;
      
      return {
        id: asin,
        title: product.title,
        description: product.description,
        current_price: product.price?.current_price || product.price?.current,
        original_price: product.price?.previous_price || product.price?.previous || product.price?.current,
        rating: product.rating,
        rating_count: product.ratings_total,
        image_url: product.images?.[0],
        product_url: product.url,
        asin: asin,
        features: product.feature_bullets,
        brand: product.brand,
        availability: product.available ? "In Stock" : "Out of Stock"
      };
    });

    const results = await Promise.all(laptopPromises);
    const validResults = results.filter(result => result !== null);

    return new Response(
      JSON.stringify(validResults),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-laptops function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
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
