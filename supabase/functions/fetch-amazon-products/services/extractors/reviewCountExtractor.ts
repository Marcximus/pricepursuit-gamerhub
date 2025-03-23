
/**
 * Extract review count from RapidAPI Amazon product data
 */
export function extractReviewCount(product: any): number | null {
  // Log the product details for debugging
  console.log(`📊 Review count extraction for ASIN: ${product.asin || 'unknown'}`);
  
  // Check for product_num_ratings in the RapidAPI format
  if (product.product_num_ratings !== undefined) {
    console.log(`📊 Found product_num_ratings: ${product.product_num_ratings}`);
    
    if (typeof product.product_num_ratings === 'number') {
      return product.product_num_ratings;
    }
    
    if (typeof product.product_num_ratings === 'string') {
      // Handle format with commas like "1,234"
      const parsedCount = parseInt(product.product_num_ratings.replace(/,/g, ''));
      if (!isNaN(parsedCount)) {
        console.log(`📊 Extracted review count: ${parsedCount}`);
        return parsedCount;
      }
    }
  }
  
  // Fallback to legacy format - ratings_total
  if (product.ratings_total !== undefined) {
    console.log(`📊 Falling back to legacy ratings_total: ${product.ratings_total}`);
    
    if (typeof product.ratings_total === 'number') {
      return product.ratings_total;
    }
    
    if (typeof product.ratings_total === 'string') {
      // Handle format with commas
      const parsedCount = parseInt(product.ratings_total.replace(/,/g, ''));
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  // Check alternative fields
  if (product.ratingsTotal !== undefined) {
    console.log(`📊 Checking alternative field ratingsTotal: ${product.ratingsTotal}`);
    
    if (typeof product.ratingsTotal === 'number') {
      return product.ratingsTotal;
    }
    
    if (typeof product.ratingsTotal === 'string') {
      const parsedCount = parseInt(product.ratingsTotal.replace(/,/g, ''));
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  console.log(`⚠️ Could not extract review count for product: ${product.asin || 'unknown'}`);
  return null;
}
