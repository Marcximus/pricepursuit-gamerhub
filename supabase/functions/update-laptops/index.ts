
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from "./oxylabsService.ts"
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
    console.log(`Processing price update request for ${laptops.length} laptops`);

    // Process each laptop update
    const ctx = req.ctx as { waitUntil: (promise: Promise<any>) => void };
    ctx.waitUntil((async () => {
      for (const laptop of laptops) {
        try {
          console.log(`Processing price update for laptop ${laptop.id} (ASIN: ${laptop.asin})`);
          
          // Set status to in_progress
          await supabase
            .from('products')
            .update({ update_status: 'in_progress' })
            .eq('id', laptop.id);

          // Fetch latest pricing data
          const response = await fetchProductPricing(laptop.asin);
          const productData = response.results[0]?.content;

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

          // Extract only pricing and review data
          const currentPrice = productData.pricing?.current_price;
          const originalPrice = productData.pricing?.original_price;
          const rating = productData.rating?.rating;
          const ratingCount = productData.rating?.rating_count;

          // Prepare review data if available
          const reviewData = productData.reviews ? {
            rating_breakdown: productData.reviews.rating_breakdown || {},
            recent_reviews: (productData.reviews.recent_reviews || []).map(review => ({
              rating: review.rating,
              title: review.title || '',
              content: review.content || '',
              reviewer_name: review.reviewer_name || 'Anonymous',
              review_date: review.review_date,
              verified_purchase: review.verified_purchase || false,
              helpful_votes: review.helpful_votes || 0
            }))
          } : null;

          // Update product with new price and review data only
          const updateData = {
            current_price: currentPrice || null,
            original_price: originalPrice || null,
            rating: rating || null,
            rating_count: ratingCount || null,
            review_data: reviewData,
            update_status: 'completed',
            last_checked: new Date().toISOString(),
            last_updated: new Date().toISOString()
          };

          // Store current price in price history if different
          if (currentPrice) {
            const { data: existingPrice } = await supabase
              .from('price_history')
              .select('price')
              .eq('product_id', laptop.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (!existingPrice || existingPrice.price !== currentPrice) {
              await supabase
                .from('price_history')
                .insert({
                  product_id: laptop.id,
                  price: currentPrice,
                  timestamp: new Date().toISOString()
                });
            }
          }

          await supabase
            .from('products')
            .update(updateData)
            .eq('id', laptop.id);

          console.log(`Successfully updated price data for laptop ${laptop.id}`);

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

      console.log('Completed processing all laptop price updates');
    })());

    return new Response(
      JSON.stringify({ message: 'Price update process initiated' }),
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
