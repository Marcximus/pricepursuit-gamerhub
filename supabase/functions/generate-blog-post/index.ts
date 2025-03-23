
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

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

serve(async (req) => {
  console.log("🚀 generate-blog-post function started!");
  
  // Handle CORS preflight request - THIS IS CRITICAL
  if (req.method === 'OPTIONS') {
    console.log("⚙️ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!DEEPSEEK_API_KEY) {
      console.error("🔑❌ ERROR: DEEPSEEK_API_KEY is not set");
      throw new Error("DEEPSEEK_API_KEY is not set");
    }
    console.log("🔑✅ DeepSeek API key validated");

    // Extract the request data
    const requestData = await extractRequestData(req);
    
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
  } catch (error) {
    return createErrorResponse(error);
  }
});
