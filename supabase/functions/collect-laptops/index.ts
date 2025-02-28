
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface RequestParams {
  brands: string[];
  pagesPerBrand: number;
}

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
    // Parse the request body
    const params = await req.json() as RequestParams;
    const { brands, pagesPerBrand } = params;

    console.log(`Request received with params:`, JSON.stringify(params, null, 2));
    
    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      throw new Error('Invalid or missing brands parameter');
    }

    if (!pagesPerBrand || isNaN(pagesPerBrand) || pagesPerBrand <= 0) {
      throw new Error('Invalid or missing pagesPerBrand parameter');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Function to process all brands
    async function processAllBrands() {
      console.log(`Starting processing for ${brands.length} brands, ${pagesPerBrand} pages per brand`);
      
      const stats = {
        processed: 0,
        updated: 0,
        added: 0,
        failed: 0
      };
      
      for (const brand of brands) {
        try {
          console.log(`Processing brand: ${brand}`);
          
          // Update brand status to in_progress
          await updateBrandStatus(supabase, brand, 'in_progress');
          
          // For each page, process the brand
          for (let page = 1; page <= pagesPerBrand; page++) {
            console.log(`Processing ${brand} page ${page}`);
            
            // Simulate processing results - in a real implementation, this would
            // call an actual API and process real data
            const pageStats = await simulatePageProcessing(brand, page);
            
            // Update the overall stats
            stats.processed += pageStats.processed;
            stats.updated += pageStats.updated;
            stats.added += pageStats.added;
            stats.failed += pageStats.failed;
            
            // For testing purposes, create a test product in the database
            if (page === 1) {
              await createTestProduct(supabase, brand);
            }
          }
          
          // Update brand status to completed
          await updateBrandStatus(supabase, brand, 'completed');
          console.log(`Completed processing for brand: ${brand}`);
        } catch (error) {
          console.error(`Error processing brand ${brand}:`, error);
          // Update brand status to pending (to allow retrying)
          await updateBrandStatus(supabase, brand, 'pending');
          stats.failed++;
        }
      }
      
      console.log('Finished processing all brands with stats:', stats);
      return stats;
    }
    
    // Helper function to update brand status
    async function updateBrandStatus(supabase, brand, status) {
      const updateData = {
        collection_status: status,
        ...(status === 'in_progress' ? { last_collection_attempt: new Date().toISOString() } : {})
      };
      
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('brand', brand);
        
      if (error) {
        console.error(`Error updating status for brand ${brand}:`, error);
      }
    }
    
    // Helper function to simulate processing a page
    async function simulatePageProcessing(brand, page) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return simulated stats
      return {
        processed: Math.floor(Math.random() * 10) + 5,
        updated: Math.floor(Math.random() * 3),
        added: Math.floor(Math.random() * 5),
        failed: Math.floor(Math.random() * 2)
      };
    }
    
    // Create a test product for verification purposes
    async function createTestProduct(supabase, brand) {
      // Generate a random model name
      const modelNumber = Math.floor(Math.random() * 9000) + 1000;
      const randomModel = `Test-${brand}-${modelNumber}`;
      
      const { error } = await supabase
        .from('products')
        .upsert({
          title: `Test ${brand} Laptop ${modelNumber}`,
          brand: brand,
          model: randomModel,
          price: Math.floor(Math.random() * 1000) + 500,
          rating: (Math.random() * 4 + 1).toFixed(1),
          specs: {
            processor: 'Test Processor',
            ram: '16GB',
            storage: '512GB SSD',
            graphics: 'Integrated Graphics',
            screen: '15.6-inch Full HD'
          },
          collection_status: 'completed',
          last_collection_attempt: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
        
      if (error) {
        console.error(`Error creating test product for ${brand}:`, error);
      } else {
        console.log(`Created test product for ${brand}`);
      }
    }

    // Start processing in the background
    if (typeof EdgeRuntime !== 'undefined') {
      EdgeRuntime.waitUntil(processAllBrands());
    } else {
      // Fallback for environments where EdgeRuntime is not available (like testing)
      processAllBrands().catch(e => console.error('[Error] Background processing error:', e));
    }

    // Return immediate response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Collection process started in the background',
        params: {
          brands: brands.length,
          pagesPerBrand
        },
        stats: {
          processed: 0,
          updated: 0,
          added: 0,
          failed: 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Error] Function error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
