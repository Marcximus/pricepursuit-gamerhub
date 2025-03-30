
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
  console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("⚙️ Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders, 
      status: 204 
    });
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
    console.log(`📥 REQUEST METHOD: ${req.method}`);
    console.log(`📥 REQUEST HEADERS: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);
    
    let requestData;
    try {
      requestData = JSON.parse(requestText);
      console.log(`📝 USER PROMPT DETAILS:`);
      console.log(`   - Prompt: "${requestData.prompt?.substring(0, 50)}${requestData.prompt?.length > 50 ? '...' : ''}"`);
      console.log(`   - Category: ${requestData.category}`);
      console.log(`   - ASIN1: ${requestData.asin || 'None provided'}`);
      console.log(`   - ASIN2: ${requestData.asin2 || 'None provided'}`);
      
      if (requestData.products && Array.isArray(requestData.products)) {
        console.log(`📦 PRODUCTS ANALYSIS:`);
        console.log(`   - Total Products: ${requestData.products.length}`);
        requestData.products.forEach((product, index) => {
          console.log(`   - Product ${index + 1}:`);
          console.log(`     * Title: ${product.title?.substring(0, 50)}${product.title?.length > 50 ? '...' : ''}`);
          console.log(`     * Brand: ${product.brand || 'Unknown'}`);
          console.log(`     * ASIN: ${product.asin || 'N/A'}`);
        });
      }
    } catch (parseError) {
      console.error("❌ Failed to parse request data:", parseError);
      console.error("📄 Raw request text:", requestText);
      throw new Error("Invalid request format: " + parseError.message);
    }

    const { prompt, category, asin, asin2, products } = requestData;

    if (!prompt || !category) {
      console.error("❌ VALIDATION ERROR: Missing required parameters", { 
        prompt: !!prompt, 
        category: !!category 
      });
      return new Response(
        JSON.stringify({ error: "Prompt and category are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🎯 Generating ${category} blog post`);
    console.log(`📊 PERFORMANCE TRACKING: Started at ${Date.now()}`);

    // Variables to store product data
    let firstProductData = null;
    let secondProductData = null;
    let amazonProducts = null; // For Top10 posts

    // For Top10 posts, check if products were pre-fetched and stored in the request
    if (category === 'Top10') {
      console.log(`🔍 Checking for pre-fetched Top10 products in request...`);
      try {
        // The frontend might have included pre-fetched products in the request
        if (products && Array.isArray(products) && products.length > 0) {
          amazonProducts = products;
          console.log(`✅ Found ${amazonProducts.length} pre-fetched products for Top10 post`);
          // Log first product to debug
          if (amazonProducts[0]) {
            console.log(`📦 First product sample FULL DATA:`, JSON.stringify(amazonProducts[0]));
          } else {
            console.log(`⚠️ First product is null or undefined`);
          }
        } else {
          console.log(`⚠️ No pre-fetched products found in request for Top10 post`);
          console.log(`⚠️ Products data structure:`, JSON.stringify(products));
        }
      } catch (error) {
        logError(error, 'Error processing pre-fetched products');
        console.error(`❌ FULL ERROR DETAIL: ${JSON.stringify(error)}`);
      }
    }

    // If this is a review and has an ASIN, fetch product data
    if (category === 'Review' && asin) {
      console.log(`📦 Review post with ASIN ${asin}, fetching product data...`);
      firstProductData = await fetchProductData(asin, req.url, req.headers.get('Authorization'));
      console.log(`✅ Product data fetched for review FULL DATA:`, JSON.stringify(firstProductData));
    }
    
    // If this is a comparison and has two ASINs, fetch both product data
    if (category === 'Comparison' && asin && asin2) {
      console.log(`🔄 Comparison post with ASINs ${asin} and ${asin2}, fetching both products...`);
      firstProductData = await fetchProductData(asin, req.url, req.headers.get('Authorization'));
      secondProductData = await fetchProductData(asin2, req.url, req.headers.get('Authorization'));
      console.log(`✅ Product 1 FULL DATA:`, JSON.stringify(firstProductData));
      console.log(`✅ Product 2 FULL DATA:`, JSON.stringify(secondProductData));
    }
    
    // Create system prompt based on category and product data if available
    console.log(`📝 Generating system prompt for ${category}...`);
    const systemPrompt = getSystemPrompt(category, firstProductData, secondProductData, amazonProducts);
    console.log(`📋 System prompt created (${systemPrompt.length} characters)`);
    console.log(`📋 FULL SYSTEM PROMPT: ${systemPrompt}`);
    
    // Generate content using DeepSeek API
    try {
      const generatedContent = await generateContentWithDeepSeek(systemPrompt, prompt, DEEPSEEK_API_KEY);
      console.log(`📄 FULL GENERATED CONTENT: ${generatedContent}`);
      
      // Parse the generated content
      console.log(`🔍 Parsing generated content...`);
      const parsedContent = parseGeneratedContent(generatedContent, category);
      console.log(`✅ Content parsed successfully`);
      console.log(`📑 Title: "${parsedContent.title}"`);
      console.log(`📌 Tags: ${parsedContent.tags?.join(', ') || 'None'}`);
      console.log(`📏 Content length: ${parsedContent.content.length} characters`);
      console.log(`📎 Excerpt length: ${parsedContent.excerpt.length} characters`);
      console.log(`📄 FULL PARSED CONTENT: ${JSON.stringify(parsedContent)}`);
      
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
      console.log(`📄 FULL ENHANCED CONTENT: ${JSON.stringify(enhancedContent)}`);
      
      const finalResponse = JSON.stringify(enhancedContent);
      console.log(`📤 FINAL RESPONSE LENGTH: ${finalResponse.length} characters`);
      console.log(`📤 FULL FINAL RESPONSE: ${finalResponse}`);
      
      return new Response(
        finalResponse,
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (deepseekError) {
      console.error("❌ DeepSeek API error:", deepseekError);
      console.error("❌ FULL ERROR DETAIL:", JSON.stringify(deepseekError));
      console.error("📄 System prompt used:", systemPrompt);
      throw new Error("Failed to generate content with DeepSeek: " + deepseekError.message);
    }
  } catch (error) {
    console.error("💥 CRITICAL ERROR IN GENERATE-BLOG-POST:", error);
    console.error("💥 ERROR DETAILS:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return createErrorResponse(error);
  }
});
