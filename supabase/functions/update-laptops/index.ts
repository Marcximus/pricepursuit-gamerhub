
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchProductData } from "./oxylabsService.ts";
import { updateProductInDatabase, logUpdateStats } from "./services/database/index.ts";

console.log("Hello from update-laptops function!");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Set up Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { laptops } = await req.json();

    if (!laptops || !Array.isArray(laptops) || laptops.length === 0) {
      throw new Error("No laptops provided for update");
    }

    console.log(`Received request to update ${laptops.length} laptops`);
    console.log(`First ${Math.min(5, laptops.length)} laptops: ${laptops.slice(0, 5).map(l => l.asin).join(', ')}`);
    if (laptops.length > 5) {
      console.log(`Last ${Math.min(5, laptops.length)} laptops: ${laptops.slice(-5).map(l => l.asin).join(', ')}`);
    }
    
    // Log status distribution
    const statusCounts = laptops.reduce((acc, laptop) => {
      const status = laptop.update_status || 'null';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    console.log("Status distribution of incoming laptops:", statusCounts);

    // Count missing prices and images
    const missingPriceCount = laptops.filter(l => l.current_price === null).length;
    const missingImageCount = laptops.filter(l => !l.image_url).length;
    console.log(`Updating ${missingPriceCount} laptops with missing prices and ${missingImageCount} laptops with missing images`);

    // Increase parallelism for faster processing
    const maxParallel = 5; // Increased from 2 to 5 for better throughput
    
    console.log(`Processing with parallelism of ${maxParallel}`);

    // Process updates in batches with increased parallelism
    const results = [];
    const batchSize = maxParallel;
    
    for (let i = 0; i < laptops.length; i += batchSize) {
      const batch = laptops.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(laptops.length/batchSize)} with ${batch.length} laptops`);
      
      const batchPromises = batch.map(async (laptop) => {
        try {
          console.log(`Fetching data for ASIN ${laptop.asin} from Amazon...`);
          
          // Mark laptop as in_progress
          await supabase
            .from('products')
            .update({ update_status: 'in_progress' })
            .eq('id', laptop.id);
          
          // Add timeout for oxylabs fetch
          const controller = new AbortController();
          const fetchTimeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          try {
            // Fetch latest data from Oxylabs with timeout
            const productData = await fetchProductData(laptop.asin);
            clearTimeout(fetchTimeout);
            
            if (!productData) {
              console.error(`Failed to fetch data for ASIN ${laptop.asin}`);
              await supabase
                .from('products')
                .update({ update_status: 'error' })
                .eq('id', laptop.id);
              return { asin: laptop.asin, success: false, error: 'Data fetch failed' };
            }
            
            // Log if this is a high-priority update (missing price or image)
            if (laptop.current_price === null || !laptop.image_url) {
              console.log(`HIGH PRIORITY update for ${laptop.asin} - Missing: ${laptop.current_price === null ? 'price' : ''}${(!laptop.current_price && !laptop.image_url) ? ' and ' : ''}${!laptop.image_url ? 'image' : ''}`);
            }
            
            // Process the data and update in database with enhanced processing
            const updateResult = await updateProductInDatabase(supabase, laptop, productData);
            
            return { 
              asin: laptop.asin, 
              success: updateResult.success, 
              priceUpdated: updateResult.priceUpdated,
              imageUpdated: updateResult.imageUpdated,
              specsUpdated: updateResult.specsUpdated,
              error: updateResult.error 
            };
          } catch (error) {
            clearTimeout(fetchTimeout);
            throw error; // Rethrow to be caught by outer catch
          }
        } catch (error) {
          console.error(`Error updating laptop ${laptop.asin}:`, error);
          // Mark as error in database
          await supabase
            .from('products')
            .update({ update_status: 'error' })
            .eq('id', laptop.id);
          return { asin: laptop.asin, success: false, error: error.message };
        }
      });

      // Wait for this batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      console.log(`Completed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(laptops.length/batchSize)}`);
      
      // Add a smaller delay between batches to avoid rate limiting
      if (i + batchSize < laptops.length) {
        console.log("Adding short delay between batches to avoid rate limiting...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced to 1000ms
      }
    }
    
    // Log aggregate statistics
    const stats = logUpdateStats(results);
    console.log(`Completed updating ${laptops.length} laptops with stats:`, stats);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${laptops.length} laptops`,
        results: results,
        stats: stats
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in update-laptops function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
