
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { fetchLaptopData } from './oxylabsService.ts';
import { delay } from './utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!supabaseUrl || !supabaseKey || !username || !password) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get laptops that need updating
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true)
      .or('current_price.is.null,last_checked.lt.now()-interval\'1 day\'')
      .eq('update_status', 'pending');

    if (fetchError) {
      throw fetchError;
    }

    if (!laptops || laptops.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No laptops need updating' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${laptops.length} laptops...`);

    const updates = [];
    for (const laptop of laptops) {
      try {
        console.log(`Starting update for ASIN: ${laptop.asin}`);
        
        // Mark laptop as being updated
        await supabase
          .from('products')
          .update({ update_status: 'in_progress' })
          .eq('id', laptop.id);

        const data = await fetchLaptopData(laptop.asin, username, password);
        const content = data.results[0].content;

        if (!content) {
          throw new Error('No content in Oxylabs response');
        }

        // Extract and format all available data
        const updateData = {
          title: content.title,
          current_price: content.price,
          original_price: content.price, // Set as current price if no original price is available
          rating: content.rating,
          rating_count: content.rating_count,
          image_url: content.images?.[0], // Primary image
          brand: content.brand,
          last_checked: new Date().toISOString(),
          update_status: 'completed',
          review_data: content.reviews ? {
            rating_breakdown: content.reviews.rating_breakdown,
            recent_reviews: content.reviews.recent_reviews
          } : undefined
        };

        // Update the database
        const { error: updateError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', laptop.id);

        if (updateError) {
          throw updateError;
        }

        updates.push({ success: true, asin: laptop.asin });
        console.log(`Successfully updated laptop ${laptop.asin}`);

        // Wait 1 second before processing next laptop
        await delay(1000);

      } catch (error) {
        console.error(`Error updating laptop ${laptop.asin}:`, error);
        
        // Mark laptop as failed
        await supabase
          .from('products')
          .update({ update_status: 'error' })
          .eq('id', laptop.id);

        updates.push({ 
          success: false, 
          asin: laptop.asin, 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Update process completed',
        results: updates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-laptops function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
