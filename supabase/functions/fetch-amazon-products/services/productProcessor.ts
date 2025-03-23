
/**
 * Main processor for Amazon products
 */
import { extractPrice } from './extractors/priceExtractor';
import { extractRating } from './extractors/ratingExtractor';
import { extractReviewCount } from './extractors/reviewCountExtractor';
import { generateProductHTML } from './generators/htmlGenerator';
import { logProductData } from './utils/logger';

/**
 * Process Amazon products from RapidAPI response
 */
export function processAmazonProducts(data: any) {
  if (!data.data?.products || !Array.isArray(data.data.products) || data.data.products.length === 0) {
    console.warn("⚠️ No products found in RapidAPI response or invalid format");
    throw new Error("No products found in API response");
  }
  
  console.log(`✅ Received ${data.data?.products?.length || 0} products from RapidAPI`);
  
  // Log the structure of the first product to understand RapidAPI's response format
  if (data.data.products.length > 0) {
    logProductData(data.data.products[0]);
  }
  
  // Transform products with enhanced data extraction
  const products = data.data.products.map((product: any, index: number) => {
    // Extract basic product information with fallbacks
    const title = product.title || product.name || 'Unknown Product';
    const brand = product.brand || product.manufacturer || 'Unknown Brand';
    const asin = product.asin || '';
    const imageUrl = product.image || product.images?.[0] || '';
    const url = product.url || product.link || `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
    
    // Enhanced data extraction with improved error handling
    const price = extractPrice(product);
    const rating = extractRating(product);
    const ratingsTotal = extractReviewCount(product);
    
    // Log extracted data for debugging
    console.log(`🔍 Product #${index + 1}: "${title.substring(0, 30)}..."`);
    console.log(`⭐ Rating: ${rating || 'N/A'}, Reviews: ${ratingsTotal || 'N/A'}`);
    
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
  });
  
  console.log(`🏁 Returning ${products.length} products with complete data`);
  
  // Return all products, up to 15 max to ensure we have enough data
  return products.slice(0, 15);
}
