
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled update process...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get laptops that need updating (not in progress, oldest checked first)
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true)
      .not('update_status', 'eq', 'in_progress')
      .order('last_checked', { ascending: true, nullsFirst: true })
      .limit(10);

    if (fetchError) {
      throw new Error(`Failed to fetch laptops: ${fetchError.message}`);
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops need updating at this time');
      return new Response(
        JSON.stringify({ message: 'No laptops to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${laptops.length} laptops to update`);
    const laptopIds = laptops.map(l => l.id);

    // Mark laptops as in progress
    const { error: statusError } = await supabase
      .from('products')
      .update({ 
        update_status: 'in_progress',
        last_checked: new Date().toISOString()
      })
      .in('id', laptopIds);

    if (statusError) {
      throw new Error(`Failed to update status: ${statusError.message}`);
    }

    // Process each laptop
    const updateProcess = async () => {
      for (const laptop of laptops) {
        try {
          console.log(`Processing laptop ${laptop.asin}`);

          // Call Oxylabs API
          const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(`${Deno.env.get('OXYLABS_USERNAME')}:${Deno.env.get('OXYLABS_PASSWORD')}`)
            },
            body: JSON.stringify({
              source: 'amazon_product',
              query: laptop.asin,
              domain: 'com',
              geo_location: '90210',
              parse: true
            })
          });

          if (!response.ok) {
            throw new Error(`Oxylabs API error: ${response.statusText}`);
          }

          const data = await response.json();
          const content = data.results?.[0]?.content;

          if (!content) {
            throw new Error('Invalid response format from Oxylabs');
          }

          // Update product data
          await supabase
            .from('products')
            .update({
              title: content.title,
              description: content.description,
              current_price: content.price,
              original_price: content.price_strikethrough || content.price,
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
              last_updated: new Date().toISOString()
            })
            .eq('id', laptop.id);

          console.log(`Successfully updated laptop ${laptop.asin}`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between updates

        } catch (error) {
          console.error(`Error updating laptop ${laptop.asin}:`, error);
          
          // Mark as error
          await supabase
            .from('products')
            .update({ 
              update_status: 'error',
              last_checked: new Date().toISOString()
            })
            .eq('id', laptop.id);
        }
      }
    };

    // Use waitUntil to ensure the function runs to completion
    EdgeRuntime.waitUntil(updateProcess());

    return new Response(
      JSON.stringify({ 
        message: `Started update process for ${laptops.length} laptops`,
        laptops: laptopIds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scheduled update error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
