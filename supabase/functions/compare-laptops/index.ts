
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { getComparison } from "./deepseekService.ts";
import { parseComparisonResult } from "./responseHandler.ts";
import { Product, ComparisonResult } from "./types.ts";

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
    const { laptopLeft, laptopRight } = await req.json();
    
    if (!laptopLeft || !laptopRight) {
      console.error("❌ Missing laptop data!");
      throw new Error('Missing laptop data for comparison');
    }
    
    console.log("🔍 Comparing laptops:", {
      left: `${laptopLeft.brand} ${laptopLeft.model} (ID: ${laptopLeft.id})`,
      right: `${laptopRight.brand} ${laptopRight.model} (ID: ${laptopRight.id})`
    });

    // Call DeepSeek API for the comparison
    console.log("🤖 Calling DeepSeek API...");
    const deepseekData = await getComparison(laptopLeft, laptopRight, DEEPSEEK_API_KEY);
    
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
