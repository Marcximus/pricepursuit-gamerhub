
import { corsHeaders } from "../utils/corsHelpers.ts";

export type SearchParams = {
  query: string;
  brand?: string;
  maxPrice?: number | string;
  category?: string;
  sortBy?: string;
};

export async function searchAmazonProducts(searchParams: SearchParams) {
  const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
  
  if (!RAPIDAPI_KEY) {
    console.error("🔑❌ ERROR: RAPIDAPI_KEY is not set");
    throw new Error("RAPIDAPI_KEY is not set");
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
  console.log(`📤 RAPIDAPI REQUEST PARAMS: ${JSON.stringify(queryParams)}`);
  
  // Make the request to RapidAPI
  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ RapidAPI error: ${response.status} - ${errorText}`);
    throw new Error(`RapidAPI returned status ${response.status}: ${errorText}`);
  }

  let data;
  try {
    data = await response.json();
    console.log(`📥 RAPIDAPI RESPONSE RECEIVED - Status: ${response.status}`);
    console.log(`📥 RAPIDAPI RESPONSE PREVIEW: ${JSON.stringify(data).substring(0, 500)}...`);
    return data;
  } catch (error) {
    console.error("🔴 Error parsing RapidAPI response JSON:", error);
    throw new Error("Invalid JSON in RapidAPI response");
  }
}
