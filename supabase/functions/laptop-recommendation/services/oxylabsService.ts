
/**
 * Service for handling Oxylabs API interactions
 */
import { corsHeaders } from "../cors.ts";

interface RecommendationItem {
  model: string;
  searchQuery: string;
  priceRange: { min: number; max: number };
  reason: string;
}

/**
 * Fetches product data from Oxylabs for a recommendation
 */
export async function fetchProductData(recommendation: RecommendationItem): Promise<{ recommendation: RecommendationItem, product: any | null }> {
  try {
    console.log(`📦 Fetching product data for recommendation: ${recommendation.searchQuery}`);
    
    const oxylabsUsername = Deno.env.get("OXYLABS_USERNAME");
    const oxylabsPassword = Deno.env.get("OXYLABS_PASSWORD");
    
    if (!oxylabsUsername || !oxylabsPassword) {
      console.error("❌ Missing Oxylabs credentials");
      throw new Error("Oxylabs credentials are not configured");
    }
    
    // Prepare Oxylabs request payload
    const oxylabsPayload = {
      source: "amazon_search",
      domain: "com",
      query: recommendation.searchQuery,
      start_page: 1,
      pages: 1,
      parse: true,
      context: [
        { key: "category_id", value: "565108" } // Electronics > Computers & Accessories > Laptops
      ]
    };
    
    console.log(`📤 Oxylabs request for ${recommendation.model}:`, JSON.stringify(oxylabsPayload));
    
    // Create authorization header
    const oxylabsAuth = btoa(`${oxylabsUsername}:${oxylabsPassword}`);
    
    // Call Oxylabs API
    const oxylabsResponse = await fetch("https://realtime.oxylabs.io/v1/queries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${oxylabsAuth}`
      },
      body: JSON.stringify(oxylabsPayload)
    });
    
    if (!oxylabsResponse.ok) {
      const errorText = await oxylabsResponse.text();
      console.error(`❌ Oxylabs API error for ${recommendation.model}:`, oxylabsResponse.status, errorText);
      return { recommendation, product: null };
    }
    
    const oxylabsData = await oxylabsResponse.json();
    console.log(`✅ Received Oxylabs data for ${recommendation.model}`);
    
    // Extract first organic result
    if (oxylabsData.results && 
        oxylabsData.results[0] && 
        oxylabsData.results[0].content && 
        oxylabsData.results[0].content.results && 
        oxylabsData.results[0].content.results.organic && 
        oxylabsData.results[0].content.results.organic.length > 0) {
      
      const firstProduct = oxylabsData.results[0].content.results.organic[0];
      console.log(`🎯 Found matching product for ${recommendation.model}:`, {
        title: firstProduct.title,
        price: firstProduct.price,
        url: firstProduct.url
      });
      
      // Transform the product data into our standard format
      const processedProduct = {
        asin: firstProduct.asin,
        product_title: firstProduct.title,
        product_price: firstProduct.price || 0,
        product_original_price: firstProduct.price_upper || firstProduct.price,
        product_url: firstProduct.url,
        product_photo: firstProduct.url_image || firstProduct.images?.[0] || null,
        product_star_rating: firstProduct.rating || 0,
        product_num_ratings: firstProduct.reviews_count || 0,
        is_prime: Boolean(firstProduct.is_prime),
        delivery: firstProduct.delivery_info || null
      };
      
      return { recommendation, product: processedProduct };
    } else {
      console.log(`⚠️ No matching products found for ${recommendation.model}`);
      return { recommendation, product: null };
    }
  } catch (error) {
    console.error(`❌ Error fetching product data for ${recommendation.model}:`, error);
    return { recommendation, product: null };
  }
}
