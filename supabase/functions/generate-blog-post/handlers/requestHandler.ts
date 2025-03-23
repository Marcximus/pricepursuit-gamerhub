
/**
 * Request handler for blog post generation
 */
import { corsHeaders } from "../../_shared/cors.ts";
import { logError } from "../utils/errorHandler.ts";
import { fetchProductData } from "../services/productService.ts";

/**
 * Extracts and validates request data
 */
export async function extractRequestData(req: Request) {
  console.log("📦 Extracting request data...");
  
  // Check content length header for early error detection
  const contentLength = req.headers.get('content-length');
  console.log(`📏 Content-Length header: ${contentLength || 'not provided'}`);
  
  if (contentLength === '0') {
    console.error("❌ Content-Length is 0, request body is empty");
    throw new Error("Empty request body. Content-Length is 0.");
  }
  
  // Extract request data with additional safeguards
  const requestText = await req.text();
  console.log(`📥 REQUEST DATA LENGTH: ${requestText.length} bytes`);
  
  if (!requestText || requestText.trim() === '') {
    console.error("❌ Empty request body received");
    throw new Error("Empty request body. Please ensure you're sending valid JSON data.");
  }
  
  // Log a small preview of the received data for debugging
  console.log(`📄 Request data preview: "${requestText.substring(0, 100)}${requestText.length > 100 ? '...' : ''}"`);
  
  try {
    const requestData = JSON.parse(requestText);
    console.log(`📝 User prompt: "${requestData.prompt?.substring(0, 50)}${requestData.prompt?.length > 50 ? '...' : ''}"`);
    console.log(`🏷️ Selected category: ${requestData.category}`);
    console.log(`🔍 ASIN1: ${requestData.asin || 'None provided'}`);
    console.log(`🔍 ASIN2: ${requestData.asin2 || 'None provided'}`);
    
    return requestData;
  } catch (parseError) {
    console.error("❌ Failed to parse request data:", parseError);
    console.error("📄 Raw request text:", requestText.substring(0, 200) + "...");
    throw new Error(`Failed to parse request data: ${parseError.message}`);
  }
}

/**
 * Validates the request data
 */
export function validateRequestData(data: any) {
  // Input validation with clear error responses
  if (!data.prompt) {
    console.error("❌ Missing prompt parameter");
    throw new Error("Prompt is required");
  }
  
  if (!data.category) {
    console.error("❌ Missing category parameter");
    throw new Error("Category is required");
  }

  // Category validation - ensure we have a valid category
  const validCategories = ['Review', 'Top10', 'Comparison', 'How-To'];
  if (!validCategories.includes(data.category)) {
    console.error(`❌ Invalid category: ${data.category}`);
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }
  
  console.log(`🎯 Generating ${data.category} blog post with prompt: "${data.prompt.substring(0, 30)}..."`);
  
  return true;
}

/**
 * Fetches product data for reviews and comparisons
 */
export async function fetchRequiredProductData(category: string, asin: string | null, asin2: string | null, products: any[] | null, requestUrl: string, authHeader: string | null) {
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
    firstProductData = await fetchProductData(asin, requestUrl, authHeader);
    console.log(firstProductData ? `✅ Product data fetched successfully for review` : `❌ Failed to fetch product data for review`);
  }
  
  // If this is a comparison and has two ASINs, fetch both product data
  if (category === 'Comparison' && asin && asin2) {
    console.log(`🔄 Comparison post with ASINs ${asin} and ${asin2}, fetching both products...`);
    firstProductData = await fetchProductData(asin, requestUrl, authHeader);
    secondProductData = await fetchProductData(asin2, requestUrl, authHeader);
    console.log(`✅ Product 1 fetch: ${firstProductData ? 'Success' : 'Failed'}`);
    console.log(`✅ Product 2 fetch: ${secondProductData ? 'Success' : 'Failed'}`);
  }

  return { firstProductData, secondProductData, amazonProducts };
}

/**
 * Create a response with CORS headers
 */
export function createJsonResponse(data: any, status = 200) {
  const finalResponse = JSON.stringify(data);
  console.log(`📤 FINAL RESPONSE LENGTH: ${finalResponse.length} characters`);
  console.log(`📤 FINAL RESPONSE PREVIEW: ${finalResponse.substring(0, 500)}...`);
  
  return new Response(
    finalResponse,
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status 
    }
  );
}
