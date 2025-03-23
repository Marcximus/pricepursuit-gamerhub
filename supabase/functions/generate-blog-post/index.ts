
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Create corsHeaders outside of the main function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the DeepSeek API key from environment variables
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

serve(async (req) => {
  console.log("🚀 generate-blog-post function started!");
  console.log(`📥 Request method: ${req.method}`);
  console.log(`📥 Content-Type: ${req.headers.get('content-type') || 'not set'}`);
  console.log(`📥 Content-Length: ${req.headers.get('content-length') || 'not set'}`);
  
  // Handle CORS preflight request - THIS IS CRITICAL
  if (req.method === 'OPTIONS') {
    console.log("⚙️ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate that we have the required API key
    if (!DEEPSEEK_API_KEY) {
      console.error("🔑❌ ERROR: DEEPSEEK_API_KEY is not set");
      throw new Error("DEEPSEEK_API_KEY is not set. Please configure this secret in the Supabase dashboard.");
    }
    console.log("🔑✅ DeepSeek API key validated");
    
    // Step 1: First check if the content-type is application/json
    const contentType = req.headers.get('content-type') || '';
    console.log(`📥 Detailed content-type: ${contentType}`);
    
    if (!contentType.includes('application/json')) {
      console.error(`❌ Invalid content-type: ${contentType}, expected application/json`);
      throw new Error(`Invalid content-type: ${contentType}, expected application/json`);
    }

    // Step 2: Try to read the request body
    let requestBodyText = "";
    try {
      requestBodyText = await req.text();
      console.log(`📥 Raw request body size: ${requestBodyText.length} bytes`);
      
      // Log the first 200 characters of the body for debugging
      if (requestBodyText.length > 0) {
        console.log(`📥 Request body preview: ${requestBodyText.substring(0, 200)}...`);
      } else {
        console.error("❌ Request body is empty!");
        throw new Error("Empty request body received. Please check your request.");
      }
    } catch (bodyReadError) {
      console.error(`❌ Failed to read request body: ${bodyReadError.message}`);
      throw new Error(`Failed to read request body: ${bodyReadError.message}`);
    }
    
    // Step 3: Try to parse the request body as JSON
    let requestData;
    try {
      requestData = JSON.parse(requestBodyText);
      console.log("📦 Successfully parsed request data");
      
      // Log a concise version of request data structure
      console.log(`📦 Request structure: ${JSON.stringify({
        promptLength: requestData.prompt?.length || 0,
        category: requestData.category,
        productsCount: requestData.products?.length || 0,
      })}`);
    } catch (parseError) {
      console.error(`❌ JSON parse error: ${parseError.message}`);
      throw new Error(`Invalid JSON format: ${parseError.message}`);
    }
    
    // Step 4: Validate the request data
    if (!requestData) {
      throw new Error("No data extracted from request");
    }
    if (!requestData.prompt) {
      throw new Error("Missing required field: prompt");
    }
    if (!requestData.category) {
      throw new Error("Missing required field: category");
    }
    console.log("📋 Request validation passed");
    
    // Step 5: Process the request based on category
    const { prompt, category, asin, asin2, products } = requestData;
    
    console.log(`📝 Processing ${category} request with prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"}`);
    
    // Generate blog content using simple mock response for now just to test the pipeline
    const mockResponse = {
      title: `Top 10 Best Lenovo Laptops for ${new Date().getFullYear()}`,
      content: `<h1>Top 10 Best Lenovo Laptops for ${new Date().getFullYear()}</h1>
        <p>Looking for the best Lenovo laptops on the market? Here's our comprehensive guide to the top 10 Lenovo laptops available today.</p>
        <h2>1. Lenovo ThinkPad X1 Carbon</h2>
        <div class="product-placeholder" data-asin="B07Z36FP7L" data-index="1"></div>
        <ul class="my-4">
          <li>✅ Lightweight and portable design</li>
          <li>✅ Excellent keyboard comfort</li>
          <li>✅ Impressive battery life</li>
        </ul>
        <p>The ThinkPad X1 Carbon remains one of the best business laptops on the market.</p>`,
      excerpt: "Discover the best Lenovo laptops available today with our comprehensive guide, featuring models perfect for business, gaming, and everyday use.",
      category: category,
      tags: ["lenovo", "laptops", "thinkpad", "ideapad", "gaming laptops"]
    };
    
    console.log("✅ Successfully generated mock response");
    console.log(`📤 Response size: ${JSON.stringify(mockResponse).length} bytes`);
    
    // Return the response
    return new Response(
      JSON.stringify(mockResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    // Log and return any errors in a consistent format
    console.error(`💥 Error in generate-blog-post: ${error.message}`);
    console.error(error.stack || "No stack trace available");
    
    return new Response(
      JSON.stringify({
        error: error.message,
        title: `New Post (Error)`,
        content: `<h1>Error Generating Content</h1><p>There was an error: ${error.message}</p>`,
        excerpt: "There was an error generating this content.",
        category: "Error",
        tags: ["error"]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
