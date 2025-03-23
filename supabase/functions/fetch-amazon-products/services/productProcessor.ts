
/**
 * Main processor for Amazon products
 */
import { extractPrice } from './extractors/priceExtractor.ts';
import { extractRating } from './extractors/ratingExtractor.ts';
import { extractReviewCount } from './extractors/reviewCountExtractor.ts';
import { generateProductHTML } from './generators/htmlGenerator.ts';
import { safeStringify } from './utils/logger.ts';

/**
 * Process Amazon products from RapidAPI response
 */
export function processAmazonProducts(data: any) {
  try {
    // Validate data structure
    if (!data) {
      console.error("⚠️ Invalid RapidAPI response format - missing data object");
      throw new Error("Invalid RapidAPI response format");
    }
    
    // Check for the new API response format
    const products = data.data?.products;
    
    if (!products || !Array.isArray(products)) {
      console.error("⚠️ Invalid RapidAPI response - products is not an array");
      console.error(`⚠️ FULL INVALID RAPIDAPI RESPONSE: ${safeStringify(data)}`);
      throw new Error("Invalid RapidAPI response: products is not an array");
    }
    
    if (products.length === 0) {
      console.error("⚠️ No products found in RapidAPI response");
      throw new Error("No products found in RapidAPI response");
    }
    
    console.log(`✅ Received ${products.length} products from RapidAPI`);
    console.log(`📊 First product sample keys: ${JSON.stringify(Object.keys(products[0]))}`);
    
    // Transform products with enhanced data extraction for the new API response format
    const processedProducts = products.map((product: any, index: number) => {
      try {
        // Extract basic product information with fallbacks
        const title = product.product_title || product.title || 'Unknown Product';
        const asin = product.asin || '';
        
        // Extract image URL from the new API response format
        const imageUrl = product.product_photo || product.image || '';
        
        // Extract product URL from the new API response format
        let url = product.product_url || product.url || '';
        if (asin && !url) {
          url = `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
        } else if (url && !url.includes('tag=')) {
          // Add affiliate tag if not present
          url = url.includes('?') 
            ? `${url}&tag=with-laptop-discount-20` 
            : `${url}?tag=with-laptop-discount-20`;
        }
        
        // Extract price, rating, and review count
        const price = extractPrice(product);
        const rating = extractRating(product);
        const ratingsTotal = extractReviewCount(product);
        
        // Extract if the product is a best seller
        const isBestSeller = product.is_best_seller || false;
        
        // Extract if the product has a special deal
        const hasDiscount = product.product_original_price ? true : false;
        const originalPrice = product.product_original_price || null;
        
        // Log extracted data for debugging
        console.log(`🔍 Product #${index + 1} [${asin}]: "${title.substring(0, 30)}..."`);
        console.log(`⭐ Rating: ${rating || 'N/A'}, Reviews: ${ratingsTotal || 'N/A'}, Price: ${price || 'N/A'}`);
        
        // Generate HTML content for each product
        const htmlContent = generateProductHTML({
          title,
          asin,
          imageUrl,
          url,
          price,
          originalPrice,
          rating,
          ratingsTotal,
          isBestSeller,
          hasDiscount,
          rank: index + 1
        }, index + 1);
        
        return {
          title,
          asin,
          image: imageUrl,
          imageUrl,
          url,
          productUrl: url,
          price: price,
          original_price: originalPrice,
          rating: rating,
          ratings_total: ratingsTotal,
          is_best_seller: isBestSeller,
          rank: index + 1,
          htmlContent: htmlContent
        };
      } catch (productError) {
        console.error(`❌ Error processing product #${index + 1}:`, productError);
        // Continue processing other products
        return null;
      }
    }).filter(Boolean); // Remove null products that failed to process
    
    if (processedProducts.length === 0) {
      console.error("❌ All products failed processing");
      throw new Error("All products failed processing");
    }
    
    console.log(`🏁 Returning ${processedProducts.length} products with complete data`);
    console.log(`🏁 PROCESSED PRODUCTS SAMPLE: ${JSON.stringify(processedProducts[0] ? {
      title: processedProducts[0].title,
      price: processedProducts[0].price,
      rating: processedProducts[0].rating,
      ratings_total: processedProducts[0].ratings_total,
      htmlContentLength: processedProducts[0].htmlContent ? processedProducts[0].htmlContent.length : 0
    } : {}, null, 2)}`);
    
    // Return products, up to 15 max
    return processedProducts.slice(0, 15);
  } catch (error) {
    console.error("💥 Error in processAmazonProducts:", error);
    throw error; // Re-throw to be handled by the caller
  }
}
