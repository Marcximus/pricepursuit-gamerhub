
import { corsHeaders } from "../../_shared/cors.ts";

/**
 * Extract request data with better error handling for large payloads
 */
export async function extractRequestData(req: Request) {
  try {
    // Get content type to handle different payload formats
    const contentType = req.headers.get('content-type') || '';
    
    // Log detailed request information
    console.log(`📥 Request method: ${req.method}`);
    console.log(`📥 Content-Type: ${contentType}`);
    console.log(`📥 Content-Length: ${req.headers.get('content-length') || 'unknown'}`);
    
    // Check for empty request
    const contentLength = req.headers.get('content-length');
    if (contentLength === '0') {
      console.error("❌ Content-Length is 0, empty request received");
      throw new Error("Empty request body received");
    }
    
    // Handle different content types appropriately
    if (contentType.includes('application/json')) {
      try {
        // Parse JSON data with handling for large payloads
        const text = await req.text();
        console.log(`📥 Request payload size: ${text.length} bytes`);
        
        if (text.length === 0) {
          throw new Error("Empty request body");
        }
        
        // Parse the JSON content
        try {
          const data = JSON.parse(text);
          return data;
        } catch (jsonError) {
          console.error(`❌ JSON parse error: ${jsonError.message}`);
          throw new Error(`Invalid JSON format: ${jsonError.message}`);
        }
      } catch (textError) {
        console.error(`❌ Error reading request body: ${textError.message}`);
        throw new Error(`Error reading request body: ${textError.message}`);
      }
    } else if (contentType.includes('text/plain')) {
      const text = await req.text();
      try {
        return JSON.parse(text);
      } catch {
        return { prompt: text };
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      const data: Record<string, any> = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }
      return data;
    } else {
      // For unknown content types, try to parse as JSON
      try {
        const text = await req.text();
        console.log(`📥 Raw request body (first 200 chars): ${text.substring(0, 200)}...`);
        console.log(`📥 Raw request body length: ${text.length} bytes`);
        
        if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
          return JSON.parse(text);
        }
        return { prompt: text };
      } catch (error) {
        console.error(`❌ Error parsing unknown content type: ${error.message}`);
        throw new Error(`Unsupported content type: ${contentType}`);
      }
    }
  } catch (error) {
    console.error(`💥 Error extracting request data: ${error.message}`);
    throw error;
  }
}

/**
 * Validate request data
 */
export function validateRequestData(data: any) {
  // Check if data exists
  if (!data) {
    throw new Error("Invalid request: No data provided");
  }
  
  // Check for required fields
  if (!data.prompt) {
    throw new Error("Invalid request: Missing prompt field");
  }
  
  if (!data.category) {
    throw new Error("Invalid request: Missing category field");
  }
  
  // Log validation success
  console.log(`✅ Request data validated successfully`);
  console.log(`📝 Prompt: "${data.prompt.substring(0, 50)}${data.prompt.length > 50 ? '...' : ''}"`);
  console.log(`🏷️ Category: ${data.category}`);
  
  // For Top10 category, validate products
  if (data.category === 'Top10') {
    console.log(`🛒 Products count: ${data.products?.length || 0}`);
    if (!data.products || !Array.isArray(data.products)) {
      console.warn(`⚠️ No products array provided for Top10 category`);
    } else if (data.products.length === 0) {
      console.warn(`⚠️ Empty products array for Top10 category`);
    }
  }
  
  // For Review category, validate ASIN
  if (data.category === 'Review' && !data.asin) {
    console.warn(`⚠️ No ASIN provided for Review category`);
  }
  
  // For Comparison category, validate ASINs
  if (data.category === 'Comparison') {
    if (!data.asin) {
      console.warn(`⚠️ No primary ASIN provided for Comparison category`);
    }
    if (!data.asin2) {
      console.warn(`⚠️ No secondary ASIN provided for Comparison category`);
    }
  }
}

/**
 * Fetch required product data
 */
export async function fetchRequiredProductData(
  category: string,
  asin: string | null,
  asin2: string | null,
  products: any[] | null,
  requestUrl: string,
  authHeader: string | null
) {
  // Default response structure
  const result = {
    firstProductData: null,
    secondProductData: null,
    amazonProducts: null
  };
  
  try {
    // If we have a Top10 category with products, use them directly
    if (category === 'Top10' && products && products.length > 0) {
      console.log(`✅ Using ${products.length} pre-fetched products for Top10 content`);
      result.amazonProducts = products;
      return result;
    }
    
    // For now, just log and return the default structure
    console.log(`ℹ️ No additional product data fetching required for ${category} category`);
    return result;
  } catch (error) {
    console.error(`💥 Error fetching product data: ${error.message}`);
    return result;
  }
}

/**
 * Create JSON response with CORS headers
 */
export function createJsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status 
    }
  );
}
