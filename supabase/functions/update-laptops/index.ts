
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    // Get all laptops marked for update
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('update_status', 'pending_update')
      .order('last_checked', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch laptops: ${fetchError.message}`);
    }

    if (!laptops || laptops.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No laptops to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting sequential updates for ${laptops.length} laptops...`);

    // Process laptops one at a time with a delay
    for (const laptop of laptops) {
      try {
        console.log(`Processing ASIN: ${laptop.asin}`);
        
        // Mark laptop as in progress
        await supabase
          .from('products')
          .update({ update_status: 'in_progress' })
          .eq('id', laptop.id);
        
        // Make Oxylabs API request
        const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`)
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Received data for ${laptop.asin}:`, JSON.stringify(data));

        if (!data.results?.[0]?.content) {
          throw new Error('No content in Oxylabs response');
        }

        const content = data.results[0].content;

        // Update all laptop information
        await supabase
          .from('products')
          .update({
            title: content.title,
            current_price: content.price,
            original_price: content.original_price || content.price,
            rating: content.rating,
            rating_count: content.rating_count,
            image_url: content.images?.[0],
            last_checked: new Date().toISOString(),
            update_status: 'completed',
            review_data: content.reviews ? {
              rating_breakdown: content.reviews.rating_breakdown,
              recent_reviews: content.reviews.recent_reviews
            } : null,
            description: content.description || null,
            total_reviews: content.reviews?.total_reviews || content.rating_count || 0,
            average_rating: content.rating || null,
            last_updated: new Date().toISOString()
          })
          .eq('id', laptop.id);

        console.log(`Successfully updated laptop ${laptop.asin}`);
        
        // Wait 1 second before processing next laptop
        await delay(1000);

      } catch (error) {
        console.error(`Error updating laptop ${laptop.asin}:`, error);
        
        // Mark individual laptop as failed
        await supabase
          .from('products')
          .update({ 
            update_status: 'error',
            last_checked: new Date().toISOString()
          })
          .eq('id', laptop.id);
      }
    }

    // Check if there are more laptops to process
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('update_status', 'pending_update');

    const message = count && count > 0 
      ? `Processed batch of laptops, ${count} remaining`
      : 'All laptops processed';

    return new Response(
      JSON.stringify({ message, processedCount: laptops.length }),
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

