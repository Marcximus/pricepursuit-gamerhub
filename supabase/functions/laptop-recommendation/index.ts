
// Import necessary Deno modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Check if DEEPSEEK_API_KEY exists
    if (!Deno.env.get('DEEPSEEK_API_KEY')) {
      console.error("❌ DEEPSEEK_API_KEY environment variable is not set");
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

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

    console.log("📝 System prompt:", systemPrompt);
    console.log("📝 User prompt:", userPrompt);
    console.log("🔑 Calling DeepSeek API with key:", Deno.env.get('DEEPSEEK_API_KEY')?.substring(0, 5) + "..." + "(masked for security)");
    
    // Log DeepSeek request
    const deepseekRequest = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    console.log("📤 DeepSeek request payload:", JSON.stringify(deepseekRequest));
    
    // Call DeepSeek API with the API key from environment variables
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deepseekRequest)
    });

    console.log("📥 DeepSeek API response status:", deepseekResponse.status);
    console.log("📥 DeepSeek API response headers:", Object.fromEntries(deepseekResponse.headers.entries()));

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error("❌ DeepSeek API error:", deepseekResponse.status, errorText);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}. Response: ${errorText}`);
    }

    const responseText = await deepseekResponse.text();
    console.log("📥 Raw DeepSeek response:", responseText);
    
    let deepseekData;
    try {
      deepseekData = JSON.parse(responseText);
      console.log("✅ Parsed DeepSeek response:", JSON.stringify(deepseekData));
    } catch (parseError) {
      console.error("❌ Error parsing DeepSeek response JSON:", parseError);
      throw new Error("Invalid JSON response from DeepSeek");
    }

    if (!deepseekData.choices || !deepseekData.choices[0]?.message?.content) {
      console.error("❌ Invalid response structure from DeepSeek");
      throw new Error("Invalid response structure from DeepSeek");
    }

    // Extract and parse DeepSeek's recommendations
    let recommendations;
    try {
      // Extract JSON from the response
      const jsonContent = deepseekData.choices[0].message.content;
      console.log("📄 DeepSeek content:", jsonContent);
      
      // More robust JSON extraction - try to find a JSON object between curly braces
      let jsonString;
      try {
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        jsonString = jsonMatch ? jsonMatch[0] : jsonContent;
        console.log("📄 Extracted JSON string:", jsonString);
      } catch (error) {
        console.error("❌ Error extracting JSON from response:", error);
        jsonString = jsonContent;
      }
      
      // Parse the JSON
      const parsedData = JSON.parse(jsonString);
      console.log("✅ Parsed recommendation data:", JSON.stringify(parsedData));
      
      if (!parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
        console.error("❌ Invalid recommendations format from DeepSeek");
        throw new Error("Invalid recommendations format from DeepSeek");
      }
      
      recommendations = parsedData.recommendations;
      console.log("🎁 Final recommendations:", JSON.stringify(recommendations));
    } catch (error) {
      console.error("❌ Error parsing DeepSeek response:", error);
      throw new Error("Failed to parse laptop recommendations: " + error.message);
    }

    // Get Oxylabs credentials
    const oxylabsUsername = Deno.env.get("OXYLABS_USERNAME");
    const oxylabsPassword = Deno.env.get("OXYLABS_PASSWORD");
    
    if (!oxylabsUsername || !oxylabsPassword) {
      console.error("❌ Missing Oxylabs credentials");
      throw new Error("Oxylabs credentials are not configured");
    }

    // Now fetch actual product data from Oxylabs for each recommendation
    console.log("🔍 Fetching real product data from Oxylabs for each recommendation");
    
    const productResults = await Promise.all(
      recommendations.map(async (recommendation, index) => {
        try {
          console.log(`📦 Fetching product data for recommendation ${index + 1}: ${recommendation.searchQuery}`);
          
          // Prepare Oxylabs request payload
          const oxylabsPayload = {
            source: "amazon_search",
            domain: "com",
            query: recommendation.searchQuery,
            start_page: 1,
            pages: 1,
            parse: true,
            context: [
              { key: "category_id", value: "565108" } // Electronics > Computers & Accessories > Laptops
            ]
          };
          
          console.log(`📤 Oxylabs request for ${recommendation.model}:`, JSON.stringify(oxylabsPayload));
          
          // Create authorization header
          const oxylabsAuth = btoa(`${oxylabsUsername}:${oxylabsPassword}`);
          
          // Call Oxylabs API
          const oxylabsResponse = await fetch("https://realtime.oxylabs.io/v1/queries", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${oxylabsAuth}`
            },
            body: JSON.stringify(oxylabsPayload)
          });
          
          if (!oxylabsResponse.ok) {
            const errorText = await oxylabsResponse.text();
            console.error(`❌ Oxylabs API error for ${recommendation.model}:`, oxylabsResponse.status, errorText);
            return { recommendation, product: null };
          }
          
          const oxylabsData = await oxylabsResponse.json();
          console.log(`✅ Received Oxylabs data for ${recommendation.model}`);
          
          // Extract first organic result
          if (oxylabsData.results && 
              oxylabsData.results[0] && 
              oxylabsData.results[0].content && 
              oxylabsData.results[0].content.results && 
              oxylabsData.results[0].content.results.organic && 
              oxylabsData.results[0].content.results.organic.length > 0) {
            
            const firstProduct = oxylabsData.results[0].content.results.organic[0];
            console.log(`🎯 Found matching product for ${recommendation.model}:`, {
              title: firstProduct.title,
              price: firstProduct.price,
              url: firstProduct.url
            });
            
            // Transform the product data into our standard format
            const processedProduct = {
              asin: firstProduct.asin,
              product_title: firstProduct.title,
              product_price: firstProduct.price || 0,
              product_original_price: firstProduct.price_upper || firstProduct.price,
              product_url: firstProduct.url,
              product_photo: firstProduct.url_image || firstProduct.images?.[0] || null,
              product_star_rating: firstProduct.rating || 0,
              product_num_ratings: firstProduct.reviews_count || 0,
              is_prime: Boolean(firstProduct.is_prime),
              delivery: firstProduct.delivery_info || null
            };
            
            return { recommendation, product: processedProduct };
          } else {
            console.log(`⚠️ No matching products found for ${recommendation.model}`);
            return { recommendation, product: null };
          }
        } catch (error) {
          console.error(`❌ Error fetching product data for ${recommendation.model}:`, error);
          return { recommendation, product: null };
        }
      })
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
