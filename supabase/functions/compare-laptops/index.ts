
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;

// For CORS support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // System prompt to guide the AI response
    console.log("📝 Preparing system prompt...");
    const systemPrompt = `
You are an expert laptop comparison assistant. You provide detailed, accurate, and fair comparisons between two laptops.

When comparing laptops, analyze:
1. Processor performance (CPU)
2. Graphics capabilities (GPU)
3. Memory (RAM)
4. Storage capacity and speed
5. Display quality
6. Price-to-performance ratio
7. User ratings and reviews

Your output must be structured EXACTLY as valid JSON in the following format:
{
  "winner": "left" | "right" | "tie",
  "analysis": "Overall comparative analysis between the two laptops",
  "advantages": {
    "left": ["Advantage 1", "Advantage 2", ...],
    "right": ["Advantage 1", "Advantage 2", ...]
  },
  "recommendation": "Clear recommendation for which laptop is better for which use case",
  "valueForMoney": {
    "left": "Value assessment for left laptop",
    "right": "Value assessment for right laptop"
  }
}

IMPORTANT: You must return ONLY valid JSON that follows the exact structure above. No markdown, no explanation outside the JSON, no additional text.`;

    // Create the comparison prompt with all available product details
    console.log("💻 Building comprehensive user prompt with ALL laptop specifications...");
    const userPrompt = `
Compare these two laptops with complete details:

LEFT LAPTOP (${laptopLeft.id}):
- Brand: ${laptopLeft.brand || 'Not specified'}
- Model: ${laptopLeft.model || 'Not specified'}
- Full Title: ${laptopLeft.title || 'Not specified'}
- Processor: ${laptopLeft.processor || 'Not specified'}
- RAM: ${laptopLeft.ram || 'Not specified'}
- Storage: ${laptopLeft.storage || 'Not specified'}
- Graphics: ${laptopLeft.graphics || 'Not specified'}
- Screen: ${laptopLeft.screen_size || 'Not specified'} ${laptopLeft.screen_resolution ? `(${laptopLeft.screen_resolution})` : ''}
- Operating System: ${laptopLeft.operating_system || 'Not specified'}
- Weight: ${laptopLeft.weight || 'Not specified'}
- Battery Life: ${laptopLeft.battery_life || 'Not specified'}
- Price: $${laptopLeft.price?.toFixed(2) || 'Not specified'}
- Original Price: $${laptopLeft.original_price?.toFixed(2) || 'Not specified'}
- Rating: ${laptopLeft.rating ? `${laptopLeft.rating}/5 (${laptopLeft.rating_count} reviews)` : 'Not specified'}
- Benchmark Score: ${laptopLeft.benchmark_score || 'Not specified'}
- Wilson Score: ${laptopLeft.wilson_score || 'Not specified'}

RIGHT LAPTOP (${laptopRight.id}):
- Brand: ${laptopRight.brand || 'Not specified'}
- Model: ${laptopRight.model || 'Not specified'}
- Full Title: ${laptopRight.title || 'Not specified'}
- Processor: ${laptopRight.processor || 'Not specified'}
- RAM: ${laptopRight.ram || 'Not specified'}
- Storage: ${laptopRight.storage || 'Not specified'}
- Graphics: ${laptopRight.graphics || 'Not specified'}
- Screen: ${laptopRight.screen_size || 'Not specified'} ${laptopRight.screen_resolution ? `(${laptopRight.screen_resolution})` : ''}
- Operating System: ${laptopRight.operating_system || 'Not specified'}
- Weight: ${laptopRight.weight || 'Not specified'}
- Battery Life: ${laptopRight.battery_life || 'Not specified'}
- Price: $${laptopRight.price?.toFixed(2) || 'Not specified'}
- Original Price: $${laptopRight.original_price?.toFixed(2) || 'Not specified'}
- Rating: ${laptopRight.rating ? `${laptopRight.rating}/5 (${laptopRight.rating_count} reviews)` : 'Not specified'}
- Benchmark Score: ${laptopRight.benchmark_score || 'Not specified'}
- Wilson Score: ${laptopRight.wilson_score || 'Not specified'}

Based on the specifications above, provide a comprehensive comparison. Include which laptop is better overall, which one provides better value for money, and what are the specific advantages of each.`;

    // Call DeepSeek API for the comparison
    console.log("🤖 Calling DeepSeek API...");
    console.log("⏱️ API call starting at:", new Date().toISOString());
    
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.1  // Lower temperature for more analytical, deterministic response
      })
    });

    console.log("⏱️ API response received at:", new Date().toISOString());
    console.log("⏳ API response time:", (Date.now() - startTime) / 1000, "seconds");

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('❌ DeepSeek API error:', deepseekResponse.status, errorText);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    console.log('✅ DeepSeek response received!');
    console.log('🕒 Model used:', deepseekData.model);
    console.log('💰 Tokens used:', {
      promptTokens: deepseekData.usage?.prompt_tokens || 'unknown',
      completionTokens: deepseekData.usage?.completion_tokens || 'unknown',
      totalTokens: deepseekData.usage?.total_tokens || 'unknown'
    });
    
    // Extract the content from the DeepSeek response
    const aiContent = deepseekData.choices[0]?.message?.content;
    if (!aiContent) {
      console.error('❌ No content in DeepSeek response');
      throw new Error('No content in DeepSeek response');
    }

    // Parse the response to ensure it's valid JSON
    try {
      console.log('🧹 Cleaning up response...');
      // Clean up any potential markdown formatting
      let cleanContent = aiContent.trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
        
      console.log('🔄 Parsing JSON response...');
      const comparisonResult = JSON.parse(cleanContent);
      
      console.log('🏆 Winner determined:', comparisonResult.winner);
      console.log('📊 Advantages found:', {
        leftCount: comparisonResult.advantages?.left?.length || 0,
        rightCount: comparisonResult.advantages?.right?.length || 0
      });
      
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
