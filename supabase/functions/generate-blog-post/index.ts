
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSystemPrompt } from "./promptManager.ts";
import { parseGeneratedContent } from "./contentParser.ts";
import { createErrorResponse, logError } from "./utils/errorHandler.ts";
import { fetchProductData } from "./services/productService.ts";
import { generateContentWithDeepSeek } from "./services/aiService.ts";
import { enhanceReviewContent, enhanceComparisonContent, enhanceTop10Content } from "./services/contentEnhancer.ts";

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
    console.log("📦 Extracting request data...");
    const requestText = await req.text();
    console.log(`📥 REQUEST DATA LENGTH: ${requestText.length} bytes`);
    
    let requestData;
    try {
      requestData = JSON.parse(requestText);
      console.log(`📝 User prompt: "${requestData.prompt?.substring(0, 50)}${requestData.prompt?.length > 50 ? '...' : ''}"`);
      console.log(`🏷️ Selected category: ${requestData.category}`);
      console.log(`🔍 ASIN1: ${requestData.asin || 'None provided'}`);
      console.log(`🔍 ASIN2: ${requestData.asin2 || 'None provided'}`);
    } catch (parseError) {
      console.error("❌ Failed to parse request data:", parseError);
      console.error("📄 Raw request text:", requestText.substring(0, 200) + "...");
      throw new Error("Invalid request format: " + parseError.message);
    }

    const { prompt, category, asin, asin2, products } = requestData;

    if (!prompt || !category) {
      console.error("❌ Missing required parameters", { prompt: !!prompt, category: !!category });
      return new Response(
        JSON.stringify({ error: "Prompt and category are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Category validation - ensure we have a valid category
    const validCategories = ['Review', 'Top10', 'Comparison', 'How-To'];
    if (!validCategories.includes(category)) {
      console.error(`❌ Invalid category: ${category}`);
      return new Response(
        JSON.stringify({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🎯 Generating ${category} blog post with prompt: "${prompt.substring(0, 30)}..."`);

    // Variables to store product data
    let firstProductData = null;
    let secondProductData = null;
    let amazonProducts = null; // For Top10 posts

    // For Top10, we need specific handling of the products
    if (category === 'Top10') {
      console.log(`🔍 Checking for pre-fetched Top10 products in request...`);
      try {
        // The frontend might have included pre-fetched products in the request
        if (products && Array.isArray(products) && products.length > 0) {
          amazonProducts = products;
          console.log(`✅ Found ${amazonProducts.length} pre-fetched products for Top10 post`);
          // Log first product to debug
          if (amazonProducts[0]) {
            console.log(`📦 First product sample:`, {
              title: amazonProducts[0].title?.substring(0, 30) + "...",
              asin: amazonProducts[0].asin,
              brand: amazonProducts[0].brand,
              price: amazonProducts[0].price
            });
          }
        } else {
          console.log(`⚠️ No pre-fetched products found in request for Top10 post`);
        }
      } catch (error) {
        logError(error, 'Error processing pre-fetched products');
      }
    }

    // If this is a review and has an ASIN, fetch product data
    if (category === 'Review' && asin) {
      console.log(`📦 Review post with ASIN ${asin}, fetching product data...`);
      firstProductData = await fetchProductData(asin, req.url, req.headers.get('Authorization'));
      console.log(firstProductData ? `✅ Product data fetched successfully for review` : `❌ Failed to fetch product data for review`);
    }
    
    // If this is a comparison and has two ASINs, fetch both product data
    if (category === 'Comparison' && asin && asin2) {
      console.log(`🔄 Comparison post with ASINs ${asin} and ${asin2}, fetching both products...`);
      firstProductData = await fetchProductData(asin, req.url, req.headers.get('Authorization'));
      secondProductData = await fetchProductData(asin2, req.url, req.headers.get('Authorization'));
      console.log(`✅ Product 1 fetch: ${firstProductData ? 'Success' : 'Failed'}`);
      console.log(`✅ Product 2 fetch: ${secondProductData ? 'Success' : 'Failed'}`);
    }
    
    // Create system prompt based on category and product data if available
    console.log(`📝 Generating system prompt for ${category}...`);
    const systemPrompt = getSystemPrompt(category, firstProductData, secondProductData, amazonProducts);
    console.log(`📋 System prompt created (${systemPrompt.length} characters)`);
    
    // Generate content using DeepSeek API
    try {
      const generatedContent = await generateContentWithDeepSeek(systemPrompt, prompt, DEEPSEEK_API_KEY);
      
      // Parse the generated content
      console.log(`🔍 Parsing generated content...`);
      const parsedContent = parseGeneratedContent(generatedContent, category);
      console.log(`✅ Content parsed successfully`);
      console.log(`📑 Title: "${parsedContent.title}"`);
      console.log(`📌 Tags: ${parsedContent.tags?.join(', ') || 'None'}`);
      console.log(`📏 Content length: ${parsedContent.content.length} characters`);
      console.log(`📎 Excerpt length: ${parsedContent.excerpt.length} characters`);
      
      // Enhance the content with additional data based on category
      let enhancedContent = parsedContent;
      
      // If we have product data for a review, augment the parsed content
      if (firstProductData && category === 'Review') {
        enhancedContent = enhanceReviewContent(parsedContent, firstProductData, asin);
      }
      
      // If we have product data for a comparison, augment the parsed content
      if (firstProductData && secondProductData && category === 'Comparison') {
        enhancedContent = enhanceComparisonContent(parsedContent, firstProductData, secondProductData, asin, asin2);
      }
      
      // If this is a Top10 post, ensure we have placeholders for product data
      if (category === 'Top10') {
        enhancedContent = enhanceTop10Content(parsedContent);
      }
      
      console.log('🎉 Successfully generated blog content!');
      
      const finalResponse = JSON.stringify(enhancedContent);
      console.log(`📤 FINAL RESPONSE LENGTH: ${finalResponse.length} characters`);
      console.log(`📤 FINAL RESPONSE PREVIEW: ${finalResponse.substring(0, 500)}...`);
      
      return new Response(
        finalResponse,
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (deepseekError) {
      console.error("❌ DeepSeek API error:", deepseekError);
      console.error("📄 System prompt used:", systemPrompt.substring(0, 200) + "...");
      throw new Error("Failed to generate content with DeepSeek: " + deepseekError.message);
    }
  } catch (error) {
    return createErrorResponse(error);
  }
});
