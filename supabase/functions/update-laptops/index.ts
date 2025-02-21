
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

// Global state management with batch processing
const state = {
  isProcessing: false,
  processedCount: 0,
  totalLaptops: 0,
  batchSize: 5, // Process 5 laptops at a time
  failedUpdates: [] as Array<{ id: string; asin: string; error: string }>,
  currentBatch: 0
};

// Process laptops in smaller batches
async function processBatch(laptops: Laptop[], startIndex: number, supabase: any) {
  const batchEnd = Math.min(startIndex + state.batchSize, laptops.length);
  const batch = laptops.slice(startIndex, batchEnd);
  
  console.log(`Processing batch ${state.currentBatch + 1}: ${startIndex} to ${batchEnd - 1}`);

  const batchPromises = batch.map(laptop => processLaptop(laptop, supabase));
  await Promise.allSettled(batchPromises);

  state.processedCount += batch.length;
  state.currentBatch++;

  // Return true if there are more batches to process
  return batchEnd < laptops.length;
}

async function processLaptop(laptop: Laptop, supabase: any) {
  try {
    console.log(`Processing laptop ${laptop.asin}`);

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

    // Save all the information we get back
    const updateData = {
      title: content.title,
      description: content.description,
      current_price: content.price?.current,
      original_price: content.price?.previous,
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

    // If we have a current price, store it in price_history
    if (content.price?.current) {
      await supabase
        .from('price_history')
        .insert({
          product_id: laptop.id,
          price: content.price.current,
          timestamp: new Date().toISOString()
        });
    }

    // Update product with all new information
    await supabase
      .from('products')
      .update(updateData)
      .eq('id', laptop.id);

    console.log(`Successfully updated laptop ${laptop.asin}`);

  } catch (error) {
    console.error(`Error processing laptop ${laptop.asin}:`, error);
    state.failedUpdates.push({ 
      id: laptop.id, 
      asin: laptop.asin, 
      error: error.message 
    });
    
    // Update status to error for this specific laptop
    await supabase
      .from('products')
      .update({ 
        update_status: 'error',
        last_checked: new Date().toISOString()
      })
      .eq('id', laptop.id);
  }

  // Small delay between processing each laptop to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Main processing function that handles batches
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
      
      console.log(`Completed batch ${state.currentBatch}. Progress: ${state.processedCount}/${state.totalLaptops}`);
      
      if (!hasMoreBatches) break;
      
      // Add a small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
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

// Main request handler
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
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

// Handle function shutdown
addEventListener('beforeunload', (ev) => {
  console.log('Function shutdown initiated:', ev.detail?.reason);
  console.log(`Progress: ${state.processedCount}/${state.totalLaptops} laptops processed`);
  console.log(`Current batch: ${state.currentBatch}`);
  if (state.failedUpdates.length > 0) {
    console.log('Failed updates:', state.failedUpdates);
  }
});
