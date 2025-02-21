
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

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

    // Get laptops marked as in_progress
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true)
      .eq('update_status', 'in_progress');

    if (fetchError) {
      throw new Error(`Failed to fetch laptops: ${fetchError.message}`);
    }

    console.log(`Processing ${laptops?.length || 0} laptops...`);

    if (!laptops || laptops.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No laptops to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updates = [];
    for (const laptop of laptops) {
      try {
        console.log(`Starting update for ASIN: ${laptop.asin}`);
        
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

        // Update the database with new information
        const { error: updateError } = await supabase
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
            } : null
          })
          .eq('id', laptop.id);

        if (updateError) {
          throw updateError;
        }

        updates.push({ success: true, asin: laptop.asin });
        console.log(`Successfully updated laptop ${laptop.asin}`);

        // Wait 1 second before processing next laptop
        await new Promise(resolve => setTimeout(resolve, 1000));

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

    // Reset all in_progress laptops to pending state in case of overall function failure
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from('products')
        .update({ update_status: 'pending' })
        .eq('update_status', 'in_progress');
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
