
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";
import { corsHeaders } from "./cors.ts";
import { scrapeBrandData } from "./oxylabsService.ts";
import { processProducts } from "./productProcessor.ts";
import { Database } from "../_shared/supabase-types.ts"; // Make sure you've defined types for your Supabase DB

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Stats object to track collection results
interface CollectionStats {
  processed: number;
  updated: number;
  added: number;
  failed: number;
  skipped?: number;
}

async function processAllBrands(brands: string[], pagesPerBrand: number, startGroupIndex = 0, startBrandIndex = 0, resumeStats: CollectionStats = { processed: 0, updated: 0, added: 0, failed: 0, skipped: 0 }, detailedLogging = false) {
  console.log(`Starting processAllBrands with ${brands.length} brands, pagesPerBrand=${pagesPerBrand}, startGroupIndex=${startGroupIndex}, startBrandIndex=${startBrandIndex}`);
  console.log(`Resuming with previous stats:`, resumeStats);

  if (!brands || !Array.isArray(brands)) {
    console.error("Invalid brands array:", brands);
    throw new Error("Invalid brands array provided");
  }

  // Create batches of brands for processing
  const brandBatches: string[][] = [];
  const batchSize = 5; // Process 5 brands in parallel

  for (let i = 0; i < brands.length; i += batchSize) {
    brandBatches.push(brands.slice(i, i + batchSize));
  }

  // Initialize statistics object
  const stats: CollectionStats = {
    processed: resumeStats.processed || 0,
    updated: resumeStats.updated || 0,
    added: resumeStats.added || 0,
    failed: resumeStats.failed || 0,
    skipped: resumeStats.skipped || 0
  };

  // Save the progress after processing each brand
  async function saveProgress(groupIndex: number, brandIndex: number, isComplete = false) {
    const progressId = '7c75e6fe-c6b3-40be-9378-e44c8f45787d';
    const progressData = isComplete ? null : {
      groupIndex,
      brandIndex,
      timestamp: new Date().toISOString(),
      stats
    };

    try {
      const { error } = await supabase
        .from('collection_progress')
        .upsert({
          id: progressId,
          progress_data: progressData,
          last_updated: new Date().toISOString(),
          progress_type: 'laptop_collection'
        });

      if (error) {
        console.error('Error saving collection progress:', error);
      }
    } catch (err) {
      console.error('Exception saving collection progress:', err);
    }
  }

  // Process brands in batches
  for (let groupIndex = startGroupIndex; groupIndex < brandBatches.length; groupIndex++) {
    const group = brandBatches[groupIndex];
    
    // Skip to the starting brand index only for the first group we process
    const startIdx = groupIndex === startGroupIndex ? startBrandIndex : 0;
    
    for (let brandIndex = startIdx; brandIndex < group.length; brandIndex++) {
      const brand = group[brandIndex];
      console.log(`Processing brand ${brandIndex + 1}/${group.length} in group ${groupIndex + 1}/${brandBatches.length}: ${brand}`);

      try {
        // Mark the brand as in progress
        await updateBrandStatus(brand, 'in_progress');

        const brandStats = {
          processed: 0,
          updated: 0,
          added: 0,
          failed: 0
        };

        // Process all pages for this brand
        for (let page = 1; page <= pagesPerBrand; page++) {
          console.log(`Processing ${brand} page ${page}...`);
          
          try {
            // Scrape product data for this brand and page
            const laptops = await scrapeBrandData(brand, page);
            
            // Validate the laptops data
            if (!laptops || !Array.isArray(laptops) || laptops.length === 0) {
              console.warn(`No laptops found for ${brand} page ${page}, skipping...`);
              continue;
            }
            
            // Process the products
            const pageResult = await processProducts(laptops, brand, detailedLogging);
            
            // Update stats
            brandStats.processed += pageResult.processed;
            brandStats.updated += pageResult.updated;
            brandStats.added += pageResult.added;
            brandStats.failed += pageResult.failed;
            
            console.log(`Page ${page} results:`, pageResult);
          } catch (pageError) {
            console.error(`Error processing page ${page} for ${brand}:`, pageError);
            brandStats.failed += 1;
          }
        }

        // Update the brand status to completed
        await updateBrandStatus(brand, 'completed');
        
        // Update total stats
        stats.processed += brandStats.processed;
        stats.updated += brandStats.updated;
        stats.added += brandStats.added;
        stats.failed += brandStats.failed;
        
        console.log(`Completed brand ${brand} with stats:`, brandStats);
        console.log(`Running totals:`, stats);
        
        // Save our progress after each brand
        await saveProgress(groupIndex, brandIndex + 1);
      } catch (brandError) {
        console.error(`Error processing brand ${brand}:`, brandError);
        stats.failed += 1;
        
        // Set the brand back to pending if it failed
        try {
          await updateBrandStatus(brand, 'pending');
        } catch (resetError) {
          console.error(`Failed to reset brand status for ${brand}:`, resetError);
        }
        
        // Still save progress even on failure
        await saveProgress(groupIndex, brandIndex + 1);
      }
    }
  }

  // Mark collection as complete by saving null progress data
  await saveProgress(0, 0, true);
  
  console.log(`Collection process complete. Final stats:`, stats);
  return stats;
}

async function updateBrandStatus(brand: string, status: 'in_progress' | 'completed' | 'pending') {
  const updateData = {
    collection_status: status,
    ...(status === 'in_progress' ? { last_collection_attempt: new Date().toISOString() } : {})
  };

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('brand', brand);

  if (error) {
    console.error(`Error updating brand status for ${brand}:`, error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brands, pagesPerBrand, startGroupIndex, startBrandIndex, resumeStats, detailedLogging } = await req.json();
    
    console.log('Received collection request with params:', { 
      brandsCount: brands?.length, 
      pagesPerBrand, 
      startGroupIndex, 
      startBrandIndex,
      resumeStats,
      detailedLogging
    });

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      throw new Error('No brands provided or invalid brands array');
    }

    if (!pagesPerBrand || typeof pagesPerBrand !== 'number' || pagesPerBrand <= 0) {
      throw new Error('Invalid pagesPerBrand parameter');
    }
    
    // Process all brands and collect statistics
    const stats = await processAllBrands(
      brands, 
      pagesPerBrand, 
      startGroupIndex || 0, 
      startBrandIndex || 0, 
      resumeStats || { processed: 0, updated: 0, added: 0, failed: 0, skipped: 0 },
      detailedLogging || false
    );

    return new Response(
      JSON.stringify({
        success: true, 
        stats,
        message: `Processed ${brands.length} brands, ${stats.processed} products`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in collect-laptops function:', error);
    
    return new Response(
      JSON.stringify({
        success: false, 
        error: error.message || 'Unknown error',
        details: error.stack || 'No stack trace available'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// This syntax is required for Deno Deploy
// export default serve;
