
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface Laptop {
  id: string;
  asin: string;
}

// Track the update progress globally
let isProcessing = false;
let processedCount = 0;
let totalLaptops = 0;
let lastProcessedTimestamp = Date.now();
const PROCESSING_TIMEOUT = 60000; // 1 minute timeout

// Function to update processing status
async function updateProcessingStatus() {
  const now = Date.now();
  if (now - lastProcessedTimestamp > PROCESSING_TIMEOUT) {
    isProcessing = false;
    console.log('Processing timed out - resetting status');
  }
  lastProcessedTimestamp = now;
}

// Process laptops in smaller batches
async function processAllLaptops(laptops: Laptop[], supabase: any) {
  if (isProcessing) {
    console.log('Already processing laptops, skipping...');
    return;
  }

  isProcessing = true;
  processedCount = 0;
  totalLaptops = laptops.length;
  lastProcessedTimestamp = Date.now();

  console.log(`Starting processing of ${totalLaptops} laptops...`);

  try {
    const BATCH_SIZE = 10;
    for (let i = 0; i < laptops.length; i += BATCH_SIZE) {
      const batch = laptops.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i/BATCH_SIZE + 1}/${Math.ceil(laptops.length/BATCH_SIZE)}`);
      
      for (const laptop of batch) {
        await updateProcessingStatus();
        
        if (!isProcessing) {
          console.log('Processing stopped due to timeout');
          return;
        }

        try {
          console.log(`Processing laptop ${processedCount + 1}/${totalLaptops}: ${laptop.asin}`);

          // Update status to in_progress
          await supabase
            .from('products')
            .update({ update_status: 'in_progress' })
            .eq('id', laptop.id);

          // Make request to Oxylabs API
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
            })
          });

          if (!response.ok) {
            throw new Error(`Oxylabs API error: ${response.statusText}`);
          }

          const data = await response.json();
          console.log(`Got Oxylabs response for ${laptop.asin}`);

          if (!data.results?.[0]?.content) {
            throw new Error('Invalid response format from Oxylabs');
          }

          const content = data.results[0].content;
          const currentPrice = content.price?.current;

          // Prepare update data
          const updateData = {
            title: content.title,
            description: content.description,
            current_price: currentPrice,
            original_price: content.price?.previous || currentPrice,
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

          // Start a transaction for both updates
          const { error: updateError } = await supabase.rpc('update_product_with_price_history', {
            p_product_id: laptop.id,
            p_price: currentPrice,
            p_update_data: updateData
          });

          if (updateError) {
            throw updateError;
          }

          processedCount++;
          console.log(`Successfully updated laptop ${laptop.asin} (${processedCount}/${totalLaptops})`);

        } catch (error) {
          console.error(`Error processing laptop ${laptop.asin}:`, error);
          
          // Update status to error for this specific laptop
          await supabase
            .from('products')
            .update({ 
              update_status: 'error',
              last_checked: new Date().toISOString()
            })
            .eq('id', laptop.id);
        }

        // Wait between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  } catch (error) {
    console.error('Error in background processing:', error);
  } finally {
    isProcessing = false;
    console.log(`Completed processing ${processedCount}/${totalLaptops} laptops`);
  }
}

// Main request handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { laptops } = await req.json();
    
    if (!laptops || !Array.isArray(laptops) || laptops.length === 0) {
      throw new Error('Invalid request: laptops array is required');
    }

    console.log(`Received update request for ${laptops.length} laptops...`);
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Start background processing
    const backgroundProcessing = processAllLaptops(laptops, supabase);
    EdgeRuntime.waitUntil(backgroundProcessing);

    return new Response(
      JSON.stringify({ 
        message: `Started background processing of ${laptops.length} laptops`,
        status: 'processing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-laptops function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

addEventListener('beforeunload', (ev) => {
  console.log('Function shutdown initiated:', ev.detail?.reason);
  console.log(`Progress: ${processedCount}/${totalLaptops} laptops processed`);
});
