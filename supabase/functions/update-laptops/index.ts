
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from "../_shared/cors.ts"
import { fetchProductPricing } from "./oxylabsService.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface UpdateRequest {
  laptops: Array<{
    id: string;
    asin: string;
  }>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { laptops } = await req.json() as UpdateRequest;
    console.log(`Processing update request for ${laptops.length} laptops`);

    // Process each laptop update
    const ctx = req.ctx as { waitUntil: (promise: Promise<any>) => void };
    ctx.waitUntil((async () => {
      for (const laptop of laptops) {
        try {
          console.log(`Processing laptop ${laptop.id} (ASIN: ${laptop.asin})`);
          
          // Set status to in_progress
          await supabase
            .from('products')
            .update({ update_status: 'in_progress' })
            .eq('id', laptop.id);

          // Fetch latest pricing data
          const response = await fetchProductPricing(laptop.asin);
          const productData = response.results[0];

          if (!productData) {
            console.error(`No pricing data found for ASIN ${laptop.asin}`);
            await supabase
              .from('products')
              .update({ 
                update_status: 'error',
                last_checked: new Date().toISOString()
              })
              .eq('id', laptop.id);
            continue;
          }

          // Extract relevant pricing and review data
          const currentPrice = productData.pricing?.current_price;
          const originalPrice = productData.pricing?.original_price;
          const rating = productData.rating?.rating;
          const ratingCount = productData.rating?.rating_count;
          const reviewData = productData.reviews;

          // Update product with new data
          const updateData = {
            current_price: currentPrice || null,
            original_price: originalPrice || null,
            rating: rating || null,
            rating_count: ratingCount || null,
            review_data: reviewData || null,
            update_status: 'completed',
            last_checked: new Date().toISOString(),
            last_updated: new Date().toISOString()
          };

          await supabase
            .from('products')
            .update(updateData)
            .eq('id', laptop.id);

          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error processing laptop ${laptop.id}:`, error);
          await supabase
            .from('products')
            .update({ 
              update_status: 'error',
              last_checked: new Date().toISOString()
            })
            .eq('id', laptop.id);
        }
      }

      console.log('Completed processing all laptops');
    })());

    return new Response(
      JSON.stringify({ message: 'Update process initiated' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
