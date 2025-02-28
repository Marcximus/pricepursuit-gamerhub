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
    current_price?: number | null;
    title?: string; // Optional title for better logging
    last_checked?: string;
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
    
    // Log the full list of laptops to be processed - now with ASIN as primary identifier
    console.log('Laptops to be processed:', laptops.map(l => ({
      asin: l.asin,
      id: l.id, // Keep ID for database reference but don't use in user-facing logs
      titlePreview: l.title ? `${l.title.substring(0, 20)}...` : 'No title',
      currentPrice: l.current_price === null ? 'NULL' : `$${l.current_price}`,
      lastChecked: l.last_checked ? new Date(l.last_checked).toLocaleString() : 'Never'
    })));

    // Use EdgeRuntime for waitUntil if available, otherwise use Deno fetch API context
    const waitUntilFn = (promise: Promise<any>) => {
      if (req.ctx && typeof req.ctx.waitUntil === 'function') {
        req.ctx.waitUntil(promise);
      } else if (typeof (globalThis as any).EdgeRuntime !== 'undefined' && 
                (globalThis as any).EdgeRuntime.waitUntil) {
        (globalThis as any).EdgeRuntime.waitUntil(promise);
      } else {
        // Just run the promise without waitUntil if not available
        promise.catch(err => console.error('Background task error:', err));
      }
    };

    // Start the background processing
    waitUntilFn((async () => {
      const results = {
        success: 0,
        failed: 0,
        noPriceData: 0,
        completedWithErrors: 0
      };
      
      for (const laptop of laptops) {
        try {
          console.log(`--------------------------------------------------`);
          console.log(`🔄 Processing laptop ASIN: ${laptop.asin}`);
          if (laptop.title) {
            console.log(`Title preview: ${laptop.title.substring(0, 50)}...`);
          }
          
          // Set status to in_progress - still using id for database reference
          console.log(`Setting status to in_progress for laptop ASIN: ${laptop.asin}`);
          await supabase
            .from('products')
            .update({ update_status: 'in_progress' })
            .eq('id', laptop.id);

          // Fetch latest pricing data using ASIN
          console.log(`Fetching pricing data for ASIN: ${laptop.asin}...`);
          const response = await fetchProductPricing(laptop.asin);
          console.log(`Got response for ASIN: ${laptop.asin}, parsing results...`);
          
          const productData = response.results[0]?.content;

          if (!productData) {
            console.error(`❌ No pricing data found for ASIN: ${laptop.asin}`);
            await supabase
              .from('products')
              .update({ 
                update_status: 'error',
                last_checked: new Date().toISOString()
              })
              .eq('id', laptop.id);
            results.noPriceData++;
            continue;
          }

          // Extract only pricing and review data
          const currentPrice = productData.pricing?.current_price;
          const originalPrice = productData.pricing?.original_price;
          const rating = productData.rating?.rating;
          const ratingCount = productData.rating?.rating_count;

          console.log(`📊 Extracted data for ASIN: ${laptop.asin}:`, {
            currentPrice: currentPrice || 'NULL',
            originalPrice: originalPrice || 'NULL',
            rating: rating || 'NULL',
            ratingCount: ratingCount || 'NULL'
          });

          // Verify the price is valid - don't update with null/zero prices if we already have a price
          if (currentPrice === null || currentPrice === 0 || typeof currentPrice !== 'number') {
            console.warn(`⚠️ Invalid price (${currentPrice}) found for ASIN: ${laptop.asin}, checking existing price`);
            
            // If we have an existing price, don't overwrite with invalid value
            if (laptop.current_price && laptop.current_price > 0) {
              console.warn(`Keeping existing price $${laptop.current_price} for ASIN: ${laptop.asin} - not updating with invalid price`);
              
              // Still update other data but keep existing price
              await supabase
                .from('products')
                .update({ 
                  rating: rating || null,
                  rating_count: ratingCount || null,
                  update_status: 'completed',
                  last_checked: new Date().toISOString(),
                  last_updated: new Date().toISOString()
                })
                .eq('id', laptop.id);
                
              console.log(`✅ Kept existing price and updated other data for ASIN: ${laptop.asin}`);
              results.success++;
              continue;
            }
          }

          // Prepare review data if available
          let reviewData = null;
          if (productData.reviews) {
            console.log(`Found review data for ASIN: ${laptop.asin}`);
            const reviewCount = productData.reviews.recent_reviews ? productData.reviews.recent_reviews.length : 0;
            console.log(`Found ${reviewCount} reviews for ASIN: ${laptop.asin}`);
            
            reviewData = {
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
            };
          }

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

          console.log(`💾 Updating laptop ASIN: ${laptop.asin} with new data`, updateData);

          // Store current price in price history if different and valid
          if (currentPrice && typeof currentPrice === 'number' && currentPrice > 0) {
            console.log(`Checking price history for ASIN: ${laptop.asin}`);
            const { data: existingPrice, error: priceError } = await supabase
              .from('price_history')
              .select('price')
              .eq('product_id', laptop.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (priceError && priceError.code !== 'PGRST116') {
              console.error(`Error checking price history for ASIN: ${laptop.asin}:`, priceError);
            }

            if (!existingPrice || existingPrice.price !== currentPrice) {
              console.log(`Adding new price $${currentPrice} to history for ASIN: ${laptop.asin}`);
              await supabase
                .from('price_history')
                .insert({
                  product_id: laptop.id,
                  price: currentPrice,
                  timestamp: new Date().toISOString()
                });
            } else {
              console.log(`Price $${currentPrice} already exists in history for ASIN: ${laptop.asin}, skipping`);
            }
          } else {
            console.log(`No valid current price for ASIN: ${laptop.asin}, skipping price history update`);
          }

          const { error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', laptop.id);
            
          if (updateError) {
            console.error(`❌ Error updating ASIN: ${laptop.asin}:`, updateError);
            results.completedWithErrors++;
          } else {
            console.log(`✅ Successfully updated price data for ASIN: ${laptop.asin}`);
            results.success++;
          }

          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Error processing ASIN: ${laptop.asin}:`, error);
          await supabase
            .from('products')
            .update({ 
              update_status: 'error',
              last_checked: new Date().toISOString()
            })
            .eq('id', laptop.id);
          results.failed++;
        }
      }

      console.log('--------------------------------------------------');
      console.log('Completed processing all laptop price updates');
      console.log('Final results:', results);
    })());

    return new Response(
      JSON.stringify({ 
        message: 'Price update process initiated',
        laptopCount: laptops.length,
        laptops: laptops.map(l => ({ asin: l.asin }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error: any) {
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
