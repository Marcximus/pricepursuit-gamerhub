
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { fetchLaptopData } from "./oxylabsService.ts";
import { processLaptopProduct } from "./productProcessor.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function processPage(brand: string, page: number): Promise<any> {
  console.log(`Processing ${brand} page ${page}`);
  
  try {
    // Fetch data from Oxylabs for this brand and page
    const response = await fetchLaptopData(brand, page);
    
    if (!response || !response.results || response.results.length === 0) {
      console.log(`No results for ${brand} page ${page}`);
      return { success: false, message: "No results found" };
    }
    
    // Extract content from the first result
    const content = response.results[0].content;
    
    if (!content || !content.results) {
      console.log(`No content in results for ${brand} page ${page}`);
      return { success: false, message: "No content in results" };
    }
    
    // Access the organic results which contain the laptop data
    const organicResults = content.results.organic;
    
    if (!organicResults || !Array.isArray(organicResults) || organicResults.length === 0) {
      console.log(`No organic results for ${brand} page ${page}`);
      return { success: false, message: "No organic results" };
    }
    
    // Process each laptop in the results
    const stats = {
      processed: 0,
      updated: 0,
      added: 0,
      failed: 0
    };
    
    for (const product of organicResults) {
      try {
        // Make sure product is a valid object with required fields
        if (!product || !product.asin) {
          console.log("Invalid product data, skipping");
          stats.failed++;
          continue;
        }
        
        // Process the product and insert or update it in the database
        const result = await processLaptopProduct(product, brand, supabase);
        
        stats.processed++;
        if (result.action === 'added') stats.added++;
        if (result.action === 'updated') stats.updated++;
      } catch (error) {
        console.error(`Error processing product:`, error);
        stats.failed++;
      }
    }
    
    console.log(`Completed ${brand} page ${page} with stats:`, stats);
    return { success: true, stats };
  } catch (error) {
    console.error(`Error processing page ${page} for ${brand}:`, error);
    return { success: false, error: error.message };
  }
}

async function processBrand(brand: string, pagesPerBrand: number): Promise<any> {
  console.log(`Starting to process brand: ${brand}`);
  
  // Update status to in_progress
  try {
    await supabase
      .from('products')
      .update({ 
        collection_status: 'in_progress',
        last_collection_attempt: new Date().toISOString()
      })
      .eq('brand', brand);
  } catch (error) {
    console.error(`Error updating status for ${brand}:`, error);
  }
  
  const brandStats = {
    processed: 0,
    updated: 0,
    added: 0,
    failed: 0
  };
  
  try {
    // Process each page for this brand
    for (let page = 1; page <= pagesPerBrand; page++) {
      const pageResult = await processPage(brand, page);
      
      if (pageResult && pageResult.success && pageResult.stats) {
        brandStats.processed += pageResult.stats.processed || 0;
        brandStats.updated += pageResult.stats.updated || 0;
        brandStats.added += pageResult.stats.added || 0;
        brandStats.failed += pageResult.stats.failed || 0;
      }
    }
    
    // Update status to completed
    await supabase
      .from('products')
      .update({ collection_status: 'completed' })
      .eq('brand', brand);
    
    console.log(`Brand ${brand} processing completed with stats:`, brandStats);
    return { brand, stats: brandStats };
  } catch (error) {
    console.error(`Error processing brand ${brand}:`, error);
    
    // Reset status back to pending on error
    await supabase
      .from('products')
      .update({ collection_status: 'pending' })
      .eq('brand', brand);
    
    throw error;
  }
}

async function processAllBrands(brands: string[], pagesPerBrand: number): Promise<any> {
  console.log(`Processing ${brands.length} brands, ${pagesPerBrand} pages per brand`);
  
  const totalStats = {
    processed: 0,
    updated: 0,
    added: 0,
    failed: 0
  };
  
  for (const brand of brands) {
    try {
      const brandResult = await processBrand(brand, pagesPerBrand);
      
      // Safely update stats from the brand result
      if (brandResult && brandResult.stats) {
        totalStats.processed += brandResult.stats.processed || 0;
        totalStats.updated += brandResult.stats.updated || 0;
        totalStats.added += brandResult.stats.added || 0;
        totalStats.failed += brandResult.stats.failed || 0;
      }
    } catch (error) {
      console.error(`Error in processing brand ${brand}:`, error);
      // Continue with the next brand even if one fails
    }
  }
  
  console.log("All brands processed. Total stats:", totalStats);
  return totalStats;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  // Only respond to POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405
    });
  }
  
  try {
    // Parse the request body
    const requestData = await req.json();
    console.log("Request data:", requestData);
    
    // Extract brands and pagesPerBrand from request
    const brands = requestData.brands || [];
    const pagesPerBrand = requestData.pagesPerBrand || 3;
    
    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return new Response(
        JSON.stringify({ error: "No brands provided" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    // Process all brands
    const stats = await processAllBrands(brands, pagesPerBrand);
    
    // Return the results
    return new Response(
      JSON.stringify({ success: true, stats }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while processing the request",
        details: error.stack || "No stack trace available"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
