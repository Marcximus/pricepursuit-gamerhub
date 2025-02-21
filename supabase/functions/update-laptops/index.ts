
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface Laptop {
  id: string;
  asin: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function processLaptop(laptop: Laptop, supabase: any) {
  try {
    console.log(`Processing laptop ${laptop.asin}`);

    // Mark laptop as in_progress
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        update_status: 'in_progress',
        last_checked: new Date().toISOString()
      })
      .eq('id', laptop.id);

    if (updateError) {
      throw new Error(`Failed to mark laptop as in_progress: ${updateError.message}`);
    }

    // Make request to Oxylabs API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
        },
        body: JSON.stringify({
          source: 'amazon_product',
          query: laptop.asin,
          domain: 'com',
          geo_location: '90210',
          parse: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Oxylabs API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Got Oxylabs response for ${laptop.asin}`);

      if (!data.results?.[0]?.content) {
        throw new Error('Invalid response format from Oxylabs');
      }

      const content = data.results[0].content;
      
      // Prepare update data
      const updateData = {
        title: content.title,
        description: content.description,
        current_price: content.price?.current,
        original_price: content.price?.previous || content.price?.current,
        rating: content.rating,
        rating_count: content.rating_breakdown?.total_count,
        image_url: content.images?.[0],
        review_data: content.reviews,
        processor: content.specifications?.processor,
        ram: content.specifications?.ram,
        storage: content.specifications?.storage,
        graphics: content.specifications?.graphics,
        screen_size: content.specifications?.screen_size,
        screen_resolution: content.specifications?.screen_resolution,
        weight: content.specifications?.weight,
        battery_life: content.specifications?.battery_life,
        update_status: 'completed',
        last_checked: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      // Update product with price history
      const { error: dbError } = await supabase.rpc(
        'update_product_with_price_history',
        { 
          p_product_id: laptop.id,
          p_price: content.price?.current,
          p_update_data: updateData
        }
      );

      if (dbError) {
        throw new Error(`Database update error: ${dbError.message}`);
      }

      console.log(`Successfully updated laptop ${laptop.asin}`);
      return true;

    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }

  } catch (error) {
    console.error(`Error processing laptop ${laptop.asin}:`, error);
    
    try {
      await supabase
        .from('products')
        .update({ 
          update_status: 'error',
          last_checked: new Date().toISOString()
        })
        .eq('id', laptop.id);
    } catch (statusError) {
      console.error(`Failed to update error status for ${laptop.asin}:`, statusError);
    }
    
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { laptops } = await req.json();
    
    if (!laptops || !Array.isArray(laptops) || laptops.length === 0) {
      throw new Error('Invalid request body: laptops array is required');
    }

    if (laptops.length > 10) {
      throw new Error('Batch size too large. Maximum 10 laptops per request.');
    }

    console.log(`Processing batch of ${laptops.length} laptops...`);
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Process laptops sequentially with small delay between each
    for (const laptop of laptops) {
      await processLaptop(laptop, supabase);
      // Add a small delay between laptops
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({ 
        message: `Completed processing ${laptops.length} laptops`,
        status: 'completed'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in update-laptops function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
