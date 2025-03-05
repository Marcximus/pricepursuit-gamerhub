
// Import necessary Deno modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Laptop recommendation function started");
    const { answers } = await req.json();
    
    // Log the answers for debugging
    console.log("Received user answers:", JSON.stringify(answers));

    // Prepare the prompt for DeepSeek
    const systemPrompt = `You are an expert laptop advisor with years of experience in the computer hardware industry. 
    Your task is to recommend two specific laptop models based on the user's requirements.
    
    Provide your response in the following JSON format:
    {
      "recommendations": [
        {
          "model": "Specific laptop model name",
          "searchQuery": "Search query for Amazon (brand + model)",
          "priceRange": {"min": minimum_price, "max": maximum_price},
          "reason": "Detailed explanation of why this laptop is recommended for the user's needs"
        },
        {
          "model": "Second specific laptop model name",
          "searchQuery": "Search query for Amazon (brand + model)",
          "priceRange": {"min": minimum_price, "max": maximum_price},
          "reason": "Detailed explanation of why this laptop is recommended for the user's needs"
        }
      ]
    }
    
    Important guidelines:
    1. Recommend SPECIFIC laptop models with their exact names (e.g., "Dell XPS 15", not just "Dell laptop")
    2. The searchQuery should be optimized for Amazon search (typically brand + model)
    3. Set a reasonable price range around the expected price of the laptop
    4. Provide detailed reasoning that references the user's specific requirements
    5. The two recommendations should be different from each other to provide alternatives
    6. Ensure the recommendations match the user's budget`;

    const userPrompt = `Based on the following user preferences, recommend two specific laptop models:
    
    - Usage purpose: ${answers.usage}
    - Price range: ${answers.priceRange}
    - Preferred brand: ${answers.brand}
    - Screen size preference: ${answers.screenSize}
    - Graphics requirements: ${answers.graphics}
    - Storage needs: ${answers.storage}
    
    Please recommend two specific laptop models that would best meet these requirements.`;

    console.log("Calling DeepSeek API...");
    
    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error("DeepSeek API error:", deepseekResponse.status, errorText);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    console.log("DeepSeek response received");

    if (!deepseekData.choices || !deepseekData.choices[0]?.message?.content) {
      console.error("Invalid response from DeepSeek");
      throw new Error("Invalid response from DeepSeek");
    }

    // Extract and parse DeepSeek's recommendations
    let recommendations;
    try {
      // Extract JSON from the response
      const jsonContent = deepseekData.choices[0].message.content;
      console.log("Raw DeepSeek content:", jsonContent);
      
      // More robust JSON extraction - try to find a JSON object between curly braces
      let jsonString;
      try {
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        jsonString = jsonMatch ? jsonMatch[0] : jsonContent;
      } catch (error) {
        console.error("Error extracting JSON from response:", error);
        jsonString = jsonContent;
      }
      
      console.log("Extracted JSON string:", jsonString);
      
      // Parse the JSON
      const parsedData = JSON.parse(jsonString);
      console.log("Parsed data:", JSON.stringify(parsedData));
      
      if (!parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
        throw new Error("Invalid recommendations format from DeepSeek");
      }
      
      recommendations = parsedData.recommendations;
      console.log("Parsed recommendations:", JSON.stringify(recommendations));
    } catch (error) {
      console.error("Error parsing DeepSeek response:", error);
      throw new Error("Failed to parse laptop recommendations: " + error.message);
    }

    // Just return the recommendations without trying to fetch product data for now
    // This simplifies our function to focus on fixing the immediate issue
    return new Response(JSON.stringify({ 
      success: true, 
      data: recommendations.map(rec => ({
        recommendation: rec,
        product: null
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in laptop-recommendation function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
