
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { fetchLaptopData } from "./oxylabsService.ts";

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
          
          // For each page, process the brand using OxyLabs
          for (let page = 1; page <= pagesPerBrand; page++) {
            console.log(`Processing ${brand} page ${page}`);
            
            try {
              // Fetch actual data from OxyLabs
              const oxylabsResponse = await fetchLaptopData(brand, page);
              console.log(`OxyLabs response received for ${brand} page ${page}`);
              
              if (oxylabsResponse && oxylabsResponse.results && oxylabsResponse.results.length > 0) {
                const results = oxylabsResponse.results[0];
                
                if (results.content && results.content.results) {
                  const laptops = results.content.results;
                  console.log(`Found ${laptops.length} laptops for ${brand} on page ${page}`);
                  
                  // Process each laptop in the results
                  for (const laptop of laptops) {
                    try {
                      // Extract needed data from the laptop object
                      const processedLaptop = {
                        title: laptop.title || '',
                        brand: brand,
                        asin: laptop.asin || '',
                        current_price: parseFloat(laptop.price?.value || '0'),
                        original_price: parseFloat(laptop.price_original?.value || laptop.price?.value || '0'),
                        rating: parseFloat(laptop.rating || '0'),
                        rating_count: parseInt(laptop.ratings_total || '0', 10),
                        product_url: laptop.url || '',
                        image_url: laptop.images && laptop.images.length > 0 ? laptop.images[0] : '',
                        description: laptop.description || '',
                        collection_status: 'completed',
                        last_collection_attempt: new Date().toISOString(),
                        is_laptop: true, // Mark as laptop by default, will be filtered later if needed
                        updated_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                      };
                      
                      // Check if the product already exists
                      const { data: existingProduct, error: lookupError } = await supabase
                        .from('products')
                        .select('id')
                        .eq('asin', processedLaptop.asin)
                        .limit(1);
                        
                      if (lookupError) {
                        console.error(`Error looking up product ${processedLaptop.asin}:`, lookupError);
                        stats.failed++;
                        continue;
                      }
                      
                      if (existingProduct && existingProduct.length > 0) {
                        // Update existing product
                        const { error: updateError } = await supabase
                          .from('products')
                          .update(processedLaptop)
                          .eq('id', existingProduct[0].id);
                          
                        if (updateError) {
                          console.error(`Error updating product ${processedLaptop.asin}:`, updateError);
                          stats.failed++;
                        } else {
                          stats.updated++;
                        }
                      } else {
                        // Insert new product
                        const { error: insertError } = await supabase
                          .from('products')
                          .insert(processedLaptop);
                          
                        if (insertError) {
                          console.error(`Error inserting product ${processedLaptop.asin}:`, insertError);
                          stats.failed++;
                        } else {
                          stats.added++;
                        }
                      }
                      
                      stats.processed++;
                    } catch (itemError) {
                      console.error(`Error processing laptop item:`, itemError);
                      stats.failed++;
                    }
                  }
                } else {
                  console.log(`No laptop results found for ${brand} on page ${page}`);
                }
              } else {
                console.log(`No results returned from OxyLabs for ${brand} on page ${page}`);
              }
            } catch (pageError) {
              console.error(`Error processing page ${page} for ${brand}:`, pageError);
              stats.failed++;
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
