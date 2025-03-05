
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
        temperature: 1.0,
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
      
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : jsonContent;
      
      recommendations = JSON.parse(jsonString).recommendations;
      console.log("Parsed recommendations:", JSON.stringify(recommendations));
    } catch (error) {
      console.error("Error parsing DeepSeek response:", error);
      throw new Error("Failed to parse laptop recommendations");
    }

    // Fetch product data from RapidAPI for each recommendation
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      console.error("RapidAPI key not configured");
      throw new Error("RapidAPI key not configured");
    }

    console.log("Fetching product details from RapidAPI...");
    const productDetails = [];
    for (const recommendation of recommendations) {
      try {
        const query = encodeURIComponent(recommendation.searchQuery);
        const minPrice = recommendation.priceRange.min;
        const maxPrice = recommendation.priceRange.max;
        
        const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${query}&page=1&country=US&sort_by=RELEVANCE&min_price=${minPrice}&max_price=${maxPrice}`;
        
        console.log(`Fetching from RapidAPI: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`RapidAPI error for ${recommendation.model}:`, response.status, errorText);
          throw new Error(`RapidAPI error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`RapidAPI response for ${recommendation.model} received`);
        
        if (data.status === "OK" && data.data.products && data.data.products.length > 0) {
          // Get the first product from results
          const product = data.data.products[0];
          
          productDetails.push({
            recommendation: recommendation,
            product: product
          });
        } else {
          console.log(`No products found for ${recommendation.model}`);
          // If no products found, just include the recommendation without product data
          productDetails.push({
            recommendation: recommendation,
            product: null
          });
        }
      } catch (error) {
        console.error(`Error fetching product data for ${recommendation.model}:`, error);
        // Still include the recommendation without product data
        productDetails.push({
          recommendation: recommendation,
          product: null
        });
      }
    }

    console.log("Returning product recommendations:", productDetails.length);
    
    // Return the complete response
    return new Response(JSON.stringify({ 
      success: true, 
      data: productDetails 
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
