
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')!;

serve(async (req) => {
  console.log("🚀 Fetch Product Details function started");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("👌 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { asins } = await req.json();
    
    if (!asins || !Array.isArray(asins) || asins.length === 0) {
      throw new Error('Missing or invalid ASINs');
    }
    
    console.log(`🔍 Fetching details for ASINs: ${asins.join(', ')}`);
    
    const asinParam = asins.join('%2C');
    const url = `https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${asinParam}&country=US`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ RapidAPI error: ${response.status}`, errorBody);
      throw new Error(`RapidAPI request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Product details fetched successfully');
    
    // Handle the response which may contain a single product or multiple products
    let result;
    if (asins.length === 1) {
      // If only one ASIN was requested, return just that product's data
      result = data;
    } else {
      // If multiple ASINs were requested, return an array of products
      // The API might return an array or an object with multiple keys
      if (Array.isArray(data)) {
        result = data;
      } else if (data && typeof data === 'object') {
        // Check if it's a single response with multiple products in a data array
        if (data.data && Array.isArray(data.data)) {
          result = data.data;
        } else {
          // Return the entire data object as is
          result = data;
        }
      }
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error: any) {
    console.error('❌ Error in fetch-product-details function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
