/**
 * Main processor for Amazon products
 */
import { extractPrice } from './extractors/priceExtractor.ts';
import { extractRating } from './extractors/ratingExtractor.ts';
import { extractReviewCount } from './extractors/reviewCountExtractor.ts';
import { generateProductHTML } from './generators/htmlGenerator.ts';
import { logProductData, safeStringify } from './utils/logger.ts';

/**
 * Process Amazon products from RapidAPI response
 */
export function processAmazonProducts(data: any) {
  try {
    // Validate data structure
    if (!data || !data.data) {
      console.error("⚠️ Invalid RapidAPI response format - missing data object");
      console.error(`⚠️ FULL INVALID RAPIDAPI RESPONSE: ${safeStringify(data)}`);
      throw new Error("Invalid RapidAPI response format: missing data object");
    }
    
    if (!data.data.products || !Array.isArray(data.data.products)) {
      console.error("⚠️ Invalid RapidAPI response - products is not an array");
      console.error(`⚠️ FULL INVALID RAPIDAPI RESPONSE: ${safeStringify(data)}`);
      throw new Error("Invalid RapidAPI response: products is not an array");
    }
    
    if (data.data.products.length === 0) {
      console.error("⚠️ No products found in RapidAPI response");
      console.error(`⚠️ FULL EMPTY RAPIDAPI RESPONSE: ${safeStringify(data)}`);
      throw new Error("No products found in RapidAPI response");
    }
    
    console.log(`✅ Received ${data.data.products.length} products from RapidAPI`);
    
    // To reduce log size, only log a subset of the full response
    console.log(`📦 RAPIDAPI RESPONSE STRUCTURE: ${JSON.stringify({
      responseKeys: Object.keys(data),
      dataKeys: Object.keys(data.data),
      totalProducts: data.data.products.length,
      sampleProductKeys: data.data.products[0] ? Object.keys(data.data.products[0]) : []
    }, null, 2)}`);
    
    // Log the structure of the first product to understand RapidAPI's response format
    if (data.data.products.length > 0) {
      logProductData(data.data.products[0]);
    }
    
    // Transform products with enhanced data extraction
    const products = data.data.products.map((product: any, index: number) => {
      try {
        // Extract basic product information with fallbacks
        const title = product.title || product.name || 'Unknown Product';
        const brand = product.brand || product.manufacturer || 'Unknown Brand';
        const asin = product.asin || '';
        const imageUrl = product.image || (product.images && product.images[0]) || '';
        const url = product.url || product.link || `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
        
        // Enhanced data extraction with improved error handling
        const price = extractPrice(product);
        const rating = extractRating(product);
        const ratingsTotal = extractReviewCount(product);
        
        // Log extracted data for debugging
        console.log(`🔍 Product #${index + 1}: "${title.substring(0, 30)}..."`);
        console.log(`⭐ Rating: ${rating || 'N/A'}, Reviews: ${ratingsTotal || 'N/A'}, Price: ${price || 'N/A'}`);
        
        // Generate HTML content for each product
        const htmlContent = generateProductHTML({
          ...product,
          title,
          brand,
          asin,
          imageUrl,
          url,
          price,
          rating,
          ratingsTotal,
          rank: index + 1
        }, index + 1);
        
        return {
          ...product,
          title,
          brand,
          asin,
          image: imageUrl,
          imageUrl,
          url,
          productUrl: url,
          price: price,
          rating: rating,
          ratings_total: ratingsTotal,
          rank: index + 1,
          htmlContent: htmlContent,
          _rawData: true
        };
      } catch (productError) {
        console.error(`❌ Error processing product #${index + 1}:`, productError);
        // Continue processing other products
        return null;
      }
    }).filter(Boolean); // Remove null products that failed to process
    
    if (products.length === 0) {
      console.error("❌ All products failed processing");
      throw new Error("All products failed processing");
    }
    
    console.log(`🏁 Returning ${products.length} products with complete data`);
    console.log(`🏁 PROCESSED PRODUCTS SAMPLE: ${JSON.stringify(products[0] ? {
      title: products[0].title,
      price: products[0].price,
      rating: products[0].rating,
      ratings_total: products[0].ratings_total,
      htmlContentLength: products[0].htmlContent ? products[0].htmlContent.length : 0
    } : {}, null, 2)}`);
    
    // Return all products, up to 15 max to ensure we have enough data
    return products.slice(0, 15);
  } catch (error) {
    console.error("💥 Error in processAmazonProducts:", error);
    throw error; // Re-throw to be handled by the caller
  }
}
