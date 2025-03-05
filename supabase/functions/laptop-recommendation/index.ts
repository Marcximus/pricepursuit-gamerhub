
// Import necessary Deno modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Import our modules
import { corsHeaders } from "./cors.ts";
import { getLaptopRecommendations, extractRecommendations } from "./services/deepseekService.ts";
import { fetchProductData } from "./services/oxylabsService.ts";
import { generateSystemPrompt, generateUserPrompt } from "./utils/promptUtils.ts";

serve(async (req) => {
  // Log request information
  console.log("🔍 Request received:", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("👌 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Laptop recommendation function started");
    
    // Get request body and log it
    const requestText = await req.text();
    console.log("📦 Raw request body:", requestText);
    
    let requestData;
    try {
      requestData = JSON.parse(requestText);
      console.log("✅ Parsed request data:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("❌ Error parsing request JSON:", parseError);
      throw new Error("Invalid JSON in request body");
    }
    
    const { answers } = requestData;
    if (!answers) {
      console.error("❌ Missing answers in request data");
      throw new Error("Missing answers in request data");
    }
    
    // Log the answers for debugging
    console.log("📋 Received user answers:", JSON.stringify(answers));

    // Generate prompts for DeepSeek
    const systemPrompt = generateSystemPrompt();
    const userPrompt = generateUserPrompt(answers);
    
    // Call DeepSeek to get recommendations
    const deepseekData = await getLaptopRecommendations({
      systemPrompt,
      prompt: userPrompt
    });
    
    // Extract recommendations from DeepSeek response
    const recommendations = extractRecommendations(deepseekData);
    console.log("🎁 Final recommendations:", JSON.stringify(recommendations));
    
    // Fetch product data for each recommendation
    console.log("🔍 Fetching real product data from Oxylabs for each recommendation");
    const productResults = await Promise.all(
      recommendations.map(recommendation => fetchProductData(recommendation))
    );
    
    console.log("✅ All product lookups completed");
    console.log("📤 Final response to client:", JSON.stringify({
      success: true,
      data: productResults
    }));

    // Return the final results
    return new Response(JSON.stringify({
      success: true, 
      data: productResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ Error in laptop-recommendation function:', error);
    
    const errorResponse = { 
      success: false, 
      error: error.message 
    };
    console.log("📤 Error response to client:", JSON.stringify(errorResponse));
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
