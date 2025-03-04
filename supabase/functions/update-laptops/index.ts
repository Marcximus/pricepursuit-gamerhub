
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

    console.log(`Received request to update ${laptops.length} laptops:`, 
      laptops.map(l => `ASIN: ${l.asin}, ID: ${l.id}`));

    // Process updates in parallel with enhanced error handling
    const updatePromises = laptops.map(async (laptop) => {
      try {
        console.log(`Fetching data for ASIN ${laptop.asin} from Amazon...`);
        
        // Mark laptop as in_progress
        await supabase
          .from('products')
          .update({ update_status: 'in_progress' })
          .eq('id', laptop.id);
        
        // Fetch latest data from Oxylabs
        const productData = await fetchProductData(laptop.asin);
        
        if (!productData) {
          console.error(`Failed to fetch data for ASIN ${laptop.asin}`);
          await supabase
            .from('products')
            .update({ update_status: 'error' })
            .eq('id', laptop.id);
          return { asin: laptop.asin, success: false, error: 'Data fetch failed' };
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
        console.error(`Error updating laptop ${laptop.asin}:`, error);
        // Mark as error in database
        await supabase
          .from('products')
          .update({ update_status: 'error' })
          .eq('id', laptop.id);
        return { asin: laptop.asin, success: false, error: error.message };
      }
    });

    const results = await Promise.all(updatePromises);
    
    // Log aggregate statistics
    const stats = logUpdateStats(results);
    
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
