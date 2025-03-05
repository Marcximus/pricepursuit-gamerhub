
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
 * Extracts price from different possible formats
 */
function extractPrice(priceData: any): string | number {
  // If it's already a number, return it
  if (typeof priceData === 'number' && !isNaN(priceData)) {
    return priceData;
  }
  
  // If it's a string that contains a price (e.g. "$599.99")
  if (typeof priceData === 'string') {
    // Try to extract numeric value from string
    const numericValue = parseFloat(priceData.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericValue)) {
      return numericValue;
    }
  }
  
  // If it's an object with price-related properties
  if (priceData && typeof priceData === 'object') {
    // Check common price field names
    const possibleFields = ['value', 'current', 'amount', 'currentPrice'];
    for (const field of possibleFields) {
      if (priceData[field] !== undefined) {
        return extractPrice(priceData[field]); // Recursively extract from nested object
      }
    }
  }
  
  // Default fallback - return the recommendation price range min
  return null;
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
      
      // Log detailed price information for debugging
      console.log(`🔍 Price data for ${recommendation.model}:`, {
        rawPrice: firstProduct.price,
        priceType: typeof firstProduct.price,
        priceUpper: firstProduct.price_upper,
        originalPrice: firstProduct.original_price,
        allPriceRelatedFields: Object.keys(firstProduct).filter(key => key.includes('price'))
      });
      
      // Extract price using the improved function
      const extractedPrice = extractPrice(firstProduct.price);
      const extractedOriginalPrice = extractPrice(firstProduct.price_upper || firstProduct.original_price);
      
      console.log(`💰 Extracted price for ${recommendation.model}:`, {
        extractedPrice,
        extractedOriginalPrice,
        usingFallbackPrice: extractedPrice === null
      });
      
      // If we couldn't extract a price, use the recommendation price range min as fallback
      const finalPrice = extractedPrice !== null ? extractedPrice : recommendation.priceRange.min;
      
      console.log(`🎯 Found matching product for ${recommendation.model}:`, {
        title: firstProduct.title,
        price: finalPrice,
        originalExtractedPrice: extractedPrice,
        url: firstProduct.url
      });
      
      // Transform the product data into our standard format
      const processedProduct = {
        asin: firstProduct.asin,
        product_title: firstProduct.title,
        product_price: finalPrice,
        product_original_price: extractedOriginalPrice || null,
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
