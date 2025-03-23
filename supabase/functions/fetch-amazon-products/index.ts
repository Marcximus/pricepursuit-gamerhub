
import { serve } from "std/http/server";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, handleCorsPreflightRequest } from "./utils/corsHelpers.ts";
import { searchAmazonProducts } from "./services/rapidApiService.ts";
import { processAmazonProducts } from "./services/productProcessor.ts";

serve(async (req) => {
  console.log("🚀 fetch-amazon-products function started!");
  
  // Handle CORS preflight request
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Extract the request data
    console.log("📦 Extracting request data...");
    const requestText = await req.text();
    console.log(`📥 FULL REQUEST DATA: ${requestText}`);
    
    let requestData;
    try {
      requestData = JSON.parse(requestText);
      console.log(`📥 PARSED REQUEST DATA: ${JSON.stringify(requestData)}`);
    } catch (error) {
      console.error("🔴 Error parsing request JSON:", error);
      console.error("🔴 FULL ERROR DETAIL:", JSON.stringify(error));
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: error.message,
          rawRequest: requestText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Call RapidAPI to search for products 
    try {
      const data = await searchAmazonProducts(requestData);
      console.log("✅ Successfully received data from RapidAPI");
      console.log("✅ FULL RAPIDAPI RESPONSE:", JSON.stringify(data));
      
      // Apply minimal processing to preserve raw data
      const products = processAmazonProducts(data);
      console.log("✅ Products processed, returning", products.length, "products");
      console.log("✅ FULL PROCESSED PRODUCTS:", JSON.stringify(products));

      return new Response(
        JSON.stringify({ products: products }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('💥 Error from RapidAPI service:', apiError);
      console.error('💥 FULL ERROR DETAIL:', JSON.stringify(apiError));
      return new Response(
        JSON.stringify({ 
          error: apiError.message || 'Error fetching product data from RapidAPI',
          details: JSON.stringify(apiError),
          products: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }
  } catch (error) {
    console.error('💥 Error fetching Amazon products:', error);
    console.error(`⚠️ Error message: ${error.message || 'Unknown error'}`);
    console.error('💥 FULL ERROR DETAIL:', JSON.stringify(error));
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred', 
        details: JSON.stringify(error),
        products: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
