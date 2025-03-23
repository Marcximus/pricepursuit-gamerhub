
/**
 * Extract rating from RapidAPI Amazon product data
 */
export function extractRating(product: any): number | null {
  // Log the product details for debugging
  console.log(`⭐ Rating extraction for ASIN: ${product.asin || 'unknown'}`);
  
  // Check for product_star_rating in the RapidAPI format
  if (product.product_star_rating !== undefined) {
    console.log(`⭐ Found product_star_rating: ${product.product_star_rating}`);
    
    if (typeof product.product_star_rating === 'number') {
      return product.product_star_rating;
    }
    
    if (typeof product.product_star_rating === 'string') {
      const parsedRating = parseFloat(product.product_star_rating);
      if (!isNaN(parsedRating)) {
        console.log(`⭐ Extracted rating: ${parsedRating}`);
        return parsedRating;
      }
    }
  }
  
  // Fallback to legacy format
  if (product.rating !== undefined && product.rating !== null) {
    console.log(`⭐ Falling back to legacy rating format: ${product.rating}`);
    
    // Case: rating is a number
    if (typeof product.rating === 'number' && !isNaN(product.rating)) {
      return product.rating;
    }
    
    // Case: rating is a string that can be parsed as a number
    if (typeof product.rating === 'string' && product.rating.trim() !== '') {
      const parsedRating = parseFloat(product.rating);
      if (!isNaN(parsedRating)) {
        return parsedRating;
      }
    }
    
    // Case: rating is an object with a value property
    if (typeof product.rating === 'object' && product.rating !== null) {
      if (typeof product.rating.value === 'number') {
        return product.rating.value;
      }
      
      if (typeof product.rating.value === 'string') {
        const parsedValue = parseFloat(product.rating.value);
        if (!isNaN(parsedValue)) {
          return parsedValue;
        }
      }
    }
  }
  
  console.log(`⚠️ Could not extract rating for product: { title: "${product.product_title || product.title || "Unknown"}", asin: "${product.asin}" }`);
  return null;
}
