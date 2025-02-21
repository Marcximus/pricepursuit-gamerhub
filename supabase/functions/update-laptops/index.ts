
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

// Global state management
const state = {
  isProcessing: false,
  processedCount: 0,
  totalLaptops: 0,
  batchSize: 2, // Reduced batch size to 2
  failedUpdates: [] as Array<{ id: string; asin: string; error: string }>,
  currentBatch: 0
};

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

    // Call the database function to update product
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
    console.error(`Error processing laptop ${laptop.asin}:`, error);
    state.failedUpdates.push({ 
      id: laptop.id, 
      asin: laptop.asin, 
      error: error.message 
    });
    
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

async function processBatch(laptops: Laptop[], startIndex: number, supabase: any) {
  try {
    const batchEnd = Math.min(startIndex + state.batchSize, laptops.length);
    const batch = laptops.slice(startIndex, batchEnd);
    
    console.log(`Processing batch ${state.currentBatch + 1}: ${startIndex} to ${batchEnd - 1}`);

    for (const laptop of batch) {
      await processLaptop(laptop, supabase);
      // Add a delay between individual laptop processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    state.processedCount += batch.length;
    state.currentBatch++;

    console.log(`Batch ${state.currentBatch} complete. Processed ${state.processedCount}/${state.totalLaptops} laptops`);
    
    // Add a longer delay between batches
    await new Promise(resolve => setTimeout(resolve, 2000));

    return batchEnd < laptops.length;
  } catch (error) {
    console.error(`Error in batch ${state.currentBatch}:`, error);
    throw error;
  }
}

async function processAllLaptops(laptops: Laptop[], supabase: any) {
  if (state.isProcessing) {
    console.log('Already processing laptops, skipping...');
    return;
  }

  state.isProcessing = true;
  state.processedCount = 0;
  state.totalLaptops = laptops.length;
  state.currentBatch = 0;
  state.failedUpdates = [];

  console.log(`Starting batch processing of ${state.totalLaptops} laptops...`);

  try {
    let currentIndex = 0;
    while (currentIndex < laptops.length) {
      const hasMoreBatches = await processBatch(laptops, currentIndex, supabase);
      currentIndex += state.batchSize;
      
      if (!hasMoreBatches) break;
    }
  } catch (error) {
    console.error('Error in batch processing:', error);
  } finally {
    state.isProcessing = false;
    console.log(`Processing complete. ${state.processedCount}/${state.totalLaptops} laptops processed`);
    if (state.failedUpdates.length > 0) {
      console.log('Failed updates:', state.failedUpdates);
    }
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

    console.log(`Received update request for ${laptops.length} laptops...`);
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Start background processing
    const backgroundProcessing = processAllLaptops(laptops, supabase);
    EdgeRuntime.waitUntil(backgroundProcessing);

    return new Response(
      JSON.stringify({ 
        message: `Started batch processing of ${laptops.length} laptops`,
        status: 'processing',
        batch_size: state.batchSize
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

addEventListener('beforeunload', (ev) => {
  console.log('Function shutdown initiated:', ev.detail?.reason);
  console.log(`Progress: ${state.processedCount}/${state.totalLaptops} laptops processed`);
  console.log(`Current batch: ${state.currentBatch}`);
  if (state.failedUpdates.length > 0) {
    console.log('Failed updates:', state.failedUpdates);
  }
});
