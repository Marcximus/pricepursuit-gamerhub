
import { corsHeaders } from "../utils/corsHelpers.ts";

export type SearchParams = {
  query: string;
  brand?: string;
  maxPrice?: number | string;
  category?: string;
  sortBy?: string;
};

export async function searchAmazonProducts(searchParams: SearchParams) {
  try {
    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    
    if (!RAPIDAPI_KEY) {
      console.error("🔑❌ ERROR: RAPIDAPI_KEY is not set");
      throw new Error("RAPIDAPI_KEY environment variable is not configured");
    }
    console.log("🔑✅ RapidAPI key validated");
    
    const { query, brand, maxPrice, category, sortBy = "RELEVANCE" } = searchParams;
    
    if (!query) {
      console.error("🔴 Missing query parameter");
      throw new Error("Query parameter is required");
    }
    
    console.log(`📝 Search query: "${query}"`);
    console.log(`🏷️ Brand filter: ${brand || 'None'}`);
    console.log(`💰 Max price: ${maxPrice || 'None'}`);
    console.log(`🔍 Category: ${category || 'None'}`);
    console.log(`🔍 Sort by: ${sortBy || 'RELEVANCE'}`);

    // Build the query parameters
    const queryParams: Record<string, string> = {
      query: query,
      page: '1',
      country: 'US',
      sort_by: sortBy,
      product_condition: 'ALL',
      is_prime: 'false',
      deals_and_discounts: 'NONE'
    };

    // Add optional parameters if provided
    if (brand) {
      queryParams.brand = brand.toUpperCase();
    }
    
    if (maxPrice) {
      queryParams.max_price = maxPrice.toString();
    }

    // Create the request URL with query parameters
    const searchUrl = new URL('https://real-time-amazon-data.p.rapidapi.com/search');
    Object.entries(queryParams).forEach(([key, value]) => {
      searchUrl.searchParams.append(key, value);
    });

    console.log(`🔍 Making request to RapidAPI with URL: ${searchUrl.toString()}`);
    console.log(`📤 FULL RAPIDAPI REQUEST PARAMS: ${JSON.stringify(queryParams)}`);
    
    // Make the request to RapidAPI with improved error handling
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
      }
    });

    console.log(`📥 RapidAPI response status: ${response.status}`);
    console.log(`📥 RapidAPI response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

    // Check for non-JSON responses which could indicate API issues
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error(`❌ RapidAPI returned non-JSON response: ${contentType}`);
      console.error(`❌ FULL RESPONSE BODY: ${errorText}`);
      throw new Error(`RapidAPI returned non-JSON response (${response.status}): Content type: ${contentType}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ RapidAPI error: ${response.status} - ${errorText}`);
      console.error(`❌ FULL ERROR RESPONSE: ${errorText}`);
      throw new Error(`RapidAPI returned status ${response.status}: ${errorText}`);
    }

    let data;
    try {
      const responseText = await response.text();
      console.log(`📥 FULL RAPIDAPI RESPONSE TEXT: ${responseText}`);
      
      try {
        data = JSON.parse(responseText);
        console.log(`📥 RAPIDAPI RESPONSE PARSED SUCCESSFULLY`);
        return data;
      } catch (jsonError) {
        console.error("🔴 Error parsing RapidAPI response JSON:", jsonError);
        console.error("🔴 FULL ERROR DETAIL:", JSON.stringify(jsonError));
        throw new Error("Invalid JSON in RapidAPI response");
      }
    } catch (error) {
      // Capture and re-throw the error with improved details
      console.error(`💥 RapidAPI text extraction error: ${error.message || 'Unknown error'}`);
      console.error(`⚠️ Error stack: ${error.stack || 'No stack trace available'}`);
      console.error(`⚠️ FULL ERROR OBJECT: ${JSON.stringify(error)}`);
      throw error;
    }
  } catch (error) {
    // Capture and re-throw the error with improved details
    console.error(`💥 RapidAPI service error: ${error.message || 'Unknown error'}`);
    console.error(`⚠️ Error stack: ${error.stack || 'No stack trace available'}`);
    console.error(`⚠️ FULL ERROR OBJECT: ${JSON.stringify(error)}`);
    throw error; // Re-throw to be handled by the caller
  }
}
