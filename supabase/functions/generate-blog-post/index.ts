
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createErrorResponse } from "./utils/errorHandler.ts";
import { 
  extractRequestData, 
  validateRequestData, 
  fetchRequiredProductData,
  createJsonResponse 
} from "./handlers/requestHandler.ts";
import { generateBlogContent } from "./handlers/contentGenerator.ts";

// Get the DeepSeek API key from environment variables
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

serve(async (req) => {
  console.log("🚀 generate-blog-post function started!");
  
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

    // Debug request info
    console.log(`📥 Request method: ${req.method}`);
    console.log(`📥 Content-Type: ${req.headers.get('content-type')}`);
    console.log(`📥 Content-Length: ${req.headers.get('content-length') || 'unknown'}`);
    
    // Extract and validate request body
    let requestData;
    try {
      const requestBody = await req.text();
      console.log(`📥 Request body size: ${requestBody.length} bytes`);
      
      if (!requestBody || requestBody.trim() === '') {
        throw new Error("Empty request body received");
      }
      
      try {
        requestData = JSON.parse(requestBody);
        console.log("📦 Successfully parsed request data");
      } catch (parseError) {
        console.error(`❌ JSON parse error: ${parseError.message}`);
        throw new Error(`Invalid JSON format: ${parseError.message}`);
      }
    } catch (bodyError) {
      console.error(`❌ Request body error: ${bodyError.message}`);
      throw new Error(`Failed to process request body: ${bodyError.message}`);
    }
    
    // Validate the request data
    if (!requestData) {
      throw new Error("No data extracted from request");
    }
    
    console.log("📦 Request data extracted successfully");
    validateRequestData(requestData);
    
    const { prompt, category, asin, asin2, products } = requestData;

    // Fetch product data if needed
    const { firstProductData, secondProductData, amazonProducts } = 
      await fetchRequiredProductData(
        category, 
        asin, 
        asin2, 
        products, 
        req.url, 
        req.headers.get('Authorization')
      );
    
    // Generate blog content
    const blogContent = await generateBlogContent(
      prompt,
      category,
      firstProductData,
      secondProductData,
      amazonProducts,
      DEEPSEEK_API_KEY
    );
    
    // Return the generated content
    return createJsonResponse(blogContent);
  } catch (error) {
    console.error("💥 Global error catch:", error);
    return createErrorResponse(error);
  }
});
