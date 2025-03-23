
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
    console.log(`📥 Content-Length: ${req.headers.get('content-length')}`);
    
    // Check if request body is empty based on Content-Length
    const contentLength = req.headers.get('content-length');
    if (contentLength === '0' || contentLength === null) {
      console.error("❌ Content-Length is 0 or missing, potential empty request");
      // Add detailed debugging
      console.log("📝 All request headers:");
      for (const [key, value] of req.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      throw new Error("Empty request body received. Please check your request.");
    }
    
    try {
      // Extract request data with more robust error handling
      const requestData = await extractRequestData(req);
      
      // Throw clear error if data is missing
      if (!requestData) {
        throw new Error("No data extracted from request");
      }
      
      console.log("📦 Request data extracted successfully");
      
      // Validate request data
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
    } catch (processingError) {
      console.error("💥 Error processing request:", processingError);
      return createErrorResponse(processingError);
    }
  } catch (error) {
    console.error("💥 Global error catch:", error);
    return createErrorResponse(error);
  }
});
