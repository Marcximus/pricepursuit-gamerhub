
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getComparison } from "./deepseekService.ts";
import { parseComparisonResult } from "./responseHandler.ts";
import { fetchProductData } from "./oxylabsService.ts";
import type { Product, ComparisonResult } from "./types.ts";

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;

serve(async (req) => {
  console.log("🚀 Compare Laptops function started!");
  const startTime = Date.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("👌 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📦 Extracting request data...");
    const { leftAsin, rightAsin } = await req.json();
    
    if (!leftAsin || !rightAsin) {
      console.error("❌ Missing laptop ASINs!");
      throw new Error('Missing laptop ASINs for comparison');
    }
    
    console.log("🔍 Comparing laptops with ASINs:", {
      left: leftAsin,
      right: rightAsin
    });

    // Fetch fresh data from Oxylabs for both ASINs
    console.log("🔎 Fetching fresh data from Oxylabs...");
    const [leftLaptopData, rightLaptopData] = await Promise.all([
      fetchProductData(leftAsin),
      fetchProductData(rightAsin)
    ]);
    
    if (!leftLaptopData || !rightLaptopData) {
      console.error("❌ Failed to fetch product data from Oxylabs");
      throw new Error('Failed to fetch product data');
    }
    
    console.log("✅ Successfully fetched product data from Oxylabs");
    console.log("📝 Left laptop title:", leftLaptopData.results[0].content.title);
    console.log("📝 Right laptop title:", rightLaptopData.results[0].content.title);

    // Call DeepSeek API for the comparison with raw Oxylabs data
    console.log("🤖 Calling DeepSeek API...");
    const deepseekData = await getComparison(leftLaptopData, rightLaptopData, DEEPSEEK_API_KEY);
    
    // Extract the content from the DeepSeek response
    const aiContent = deepseekData.choices[0]?.message?.content;
    if (!aiContent) {
      console.error('❌ No content in DeepSeek response');
      throw new Error('No content in DeepSeek response');
    }

    // Parse the response to ensure it's valid JSON
    try {
      const comparisonResult = parseComparisonResult(aiContent);
      
      // Return the comparison result
      console.log('🎁 Returning comparison result');
      console.log("⏱️ Total function execution time:", (Date.now() - startTime) / 1000, "seconds");
      
      return new Response(
        JSON.stringify(comparisonResult),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (parseError) {
      console.error('❌ Error parsing DeepSeek response:', parseError);
      console.error('📄 Raw content:', aiContent);
      throw new Error('Invalid JSON response from DeepSeek');
    }

  } catch (error) {
    console.error('❌ Error in compare-laptops function:', error);
    console.error('⏱️ Error occurred after:', (Date.now() - startTime) / 1000, "seconds");
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
