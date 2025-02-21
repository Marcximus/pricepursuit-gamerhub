
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, initializeProcessing, updateProcessingStatus, incrementProcessedCount, getProcessingStatus } from './utils.ts';
import { fetchProductData } from './oxyLabsService.ts';
import { updateProductInDatabase, updateErrorStatus } from './databaseService.ts';

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME');
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface Laptop {
  id: string;
  asin: string;
}

// Process all laptops with proper batching and delays
async function processAllLaptops(laptops: Laptop[], supabase: any) {
  const { isProcessing } = getProcessingStatus();
  if (isProcessing) {
    console.log('Already processing laptops, skipping...');
    return { message: 'Update already in progress' };
  }

  initializeProcessing(laptops.length);
  console.log(`Starting processing of ${laptops.length} laptops...`);

  try {
    const BATCH_SIZE = 5;
    for (let i = 0; i < laptops.length; i += BATCH_SIZE) {
      const batch = laptops.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(laptops.length/BATCH_SIZE)}`);
      
      for (const laptop of batch) {
        if (!updateProcessingStatus()) {
          console.log('Processing stopped due to timeout');
          return { message: 'Processing stopped due to timeout' };
        }

        try {
          const content = await fetchProductData(laptop.asin, OXYLABS_USERNAME!, OXYLABS_PASSWORD!);
          
          if (!content) {
            throw new Error('Invalid response format from Oxylabs');
          }

          await updateProductInDatabase(supabase, laptop, content);
          const processedCount = incrementProcessedCount();
          console.log(`Successfully updated laptop ${laptop.asin} (${processedCount}/${laptops.length})`);

          // Add a delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error processing laptop ${laptop.asin}:`, error);
          await updateErrorStatus(supabase, laptop.id);
        }
      }
    }

    const { processedCount, totalLaptops } = getProcessingStatus();
    return { 
      message: `Completed processing ${processedCount}/${totalLaptops} laptops`,
      success: true
    };

  } catch (error) {
    console.error('Error in background processing:', error);
    return { 
      message: `Error processing laptops: ${error.message}`,
      success: false
    };
  }
}

// Main request handler
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { laptops } = await req.json();
    
    if (!laptops || !Array.isArray(laptops) || laptops.length === 0) {
      throw new Error('Invalid request: laptops array is required');
    }

    console.log(`Received update request for ${laptops.length} laptops`);
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Start background processing
    const processingPromise = processAllLaptops(laptops, supabase);
    EdgeRuntime.waitUntil(processingPromise);

    return new Response(
      JSON.stringify({ 
        message: `Started processing ${laptops.length} laptops`,
        status: 'processing'
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

