
// Use newer Deno standard library and a specific version of supabase-js that doesn't have the dependency issue
import { serve } from "std/http/server";
import { Deno } from "https://deno.land/std@0.177.0/lib/mod.ts";
import { getSupabaseClient, queryProducts } from "./services/database.ts";
import { processProducts } from "./services/productProcessor.ts";
import { formatProductsForDisplay } from "./services/productFormatter.ts";
import { logMemoryUsage, safeStringify } from "./services/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("🚀 fetch-top10-products function started!");
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("⚙️ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabase = getSupabaseClient();
    console.log("🔌 Supabase client initialized");
    
    // Extract the request data
    console.log("📦 Extracting request data...");
    const requestText = await req.text();
    console.log(`📥 REQUEST DATA LENGTH: ${requestText.length} characters`);
    
    if (requestText.length === 0) {
      throw new Error("Empty request body");
    }
    
    let requestJson;
    try {
      requestJson = JSON.parse(requestText);
    } catch (parseError) {
      console.error("❌ Error parsing request JSON:", parseError);
      console.error("❌ REQUEST TEXT SAMPLE:", requestText.substring(0, 500));
      throw new Error("Invalid JSON in request body");
    }
    
    const { searchParams, count = 10 } = requestJson;
    
    console.log(`🔍 Request parameters: count=${count}, searchParams:`, JSON.stringify(searchParams).substring(0, 200));
    
    if (!searchParams || !Array.isArray(searchParams)) {
      console.error("❌ Invalid searchParams:", searchParams);
      return new Response(
        JSON.stringify({ error: "Search parameters are required as an array" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Query the database for products
    const results = await queryProducts(supabase, searchParams, count);
    
    // Process products for display
    const topProducts = processProducts(results, count);
    
    // Format the product data for the blog post
    const formattedProducts = formatProductsForDisplay(topProducts);
    
    console.log(`✅ Successfully formatted ${formattedProducts.length} products`);
    console.log(`📏 HTML content sample length: ${formattedProducts[0]?.htmlContent.length || 0} characters`);
    
    const finalResponse = { products: formattedProducts };
    console.log(`📤 FINAL RESPONSE PREVIEW: ${JSON.stringify({
      productCount: formattedProducts.length,
      firstProductTitle: formattedProducts[0]?.title.substring(0, 50) + '...',
      firstProductSpecs: formattedProducts[0]?.specs
    }, null, 2)}`);
    console.log(`🏁 fetch-top10-products function completed successfully`);
    
    return new Response(
      JSON.stringify(finalResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Error in fetch-top10-products function:', error);
    console.error(`⚠️ Error message: ${error.message || 'Unknown error'}`);
    console.error(`⚠️ Error stack: ${error.stack || 'No stack trace available'}`);
    
    // Log memory usage
    logMemoryUsage();
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        success: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
