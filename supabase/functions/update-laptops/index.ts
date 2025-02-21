
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const BATCH_SIZE = 5; // Process laptops in smaller batches

interface OxylabsResponse {
  results: Array<{
    content: {
      title: string;
      price: string | null;
      ratings: string;
      reviews: string;
      brand: string;
      model_name: string;
      screen_size: string;
      cpu_model: string;
      ram_memory_installed_size: string;
      hard_disk_size: string;
      graphics_card_description: string;
      graphics_coprocessor: string;
      operating_system: string;
    };
  }>;
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get laptops that need updating
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true)
      .or('current_price.is.null,last_checked.lt.now()-interval\'1 day\'')
      .order('last_checked', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw new Error(`Failed to fetch laptops: ${fetchError.message}`);
    }

    if (!laptops || laptops.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No laptops need updating' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${laptops.length} laptops...`);

    // Update status to in_progress for selected laptops
    await supabase
      .from('products')
      .update({ update_status: 'in_progress' })
      .in('id', laptops.map(l => l.id));

    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }

    // Process each laptop with a delay between requests
    const updates = [];
    for (const laptop of laptops) {
      try {
        console.log(`Fetching data for ASIN: ${laptop.asin}`);

        const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          },
          body: JSON.stringify({
            source: 'amazon_product',
            query: laptop.asin,
            parse: true,
            parsing_instructions: {
              title: {
                _fns: [
                  {
                    _fn: "xpath_one",
                    _args: ["//span[@id=\"productTitle\"]/text()"]
                  }
                ]
              },
              price: {
                _fns: [
                  {
                    _fn: "xpath_one",
                    _args: ["//span[@class=\"a-price-whole\"]/text()"]
                  }
                ]
              },
              ratings: {
                _fns: [
                  {
                    _fn: "xpath_one",
                    _args: ["//span[@class=\"a-icon-alt\"]/text()"]
                  }
                ]
              },
              reviews: {
                _fns: [
                  {
                    _fn: "xpath_one",
                    _args: ["//span[@id=\"acrCustomerReviewText\"]/text()"]
                  }
                ]
              }
            }
          })
        });

        const data: OxylabsResponse = await response.json();
        
        if (!data.results?.[0]?.content) {
          throw new Error('No content in Oxylabs response');
        }

        const content = data.results[0].content;
        
        // Parse ratings (e.g., "4.5 out of 5 stars" -> 4.5)
        const rating = content.ratings ? 
          parseFloat(content.ratings.split(' ')[0]) : null;

        // Parse reviews count (e.g., "123 ratings" -> 123)
        const reviewCount = content.reviews ?
          parseInt(content.reviews.split(' ')[0]) : null;

        // Parse price (remove currency symbol and convert to number)
        const price = content.price ?
          parseFloat(content.price.replace(/[^0-9.]/g, '')) : null;

        // Update the database with the new information
        const { error: updateError } = await supabase
          .from('products')
          .update({
            title: content.title || undefined,
            current_price: price || undefined,
            rating: rating || undefined,
            rating_count: reviewCount || undefined,
            brand: content.brand || undefined,
            model: content.model_name || undefined,
            processor: content.cpu_model || undefined,
            ram: content.ram_memory_installed_size || undefined,
            storage: content.hard_disk_size || undefined,
            screen_size: content.screen_size || undefined,
            graphics: content.graphics_card_description || content.graphics_coprocessor || undefined,
            last_checked: new Date().toISOString(),
            update_status: 'completed'
          })
          .eq('id', laptop.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`Successfully updated laptop ${laptop.asin}`);
        updates.push({ success: true, asin: laptop.asin });

        // Add 1 second delay between processing each laptop
        await delay(1000);

      } catch (error) {
        console.error(`Error updating laptop ${laptop.asin}:`, error);
        
        // Mark the laptop as failed
        await supabase
          .from('products')
          .update({ 
            update_status: 'error',
            last_checked: new Date().toISOString()
          })
          .eq('id', laptop.id);

        updates.push({ success: false, asin: laptop.asin, error: error.message });
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

