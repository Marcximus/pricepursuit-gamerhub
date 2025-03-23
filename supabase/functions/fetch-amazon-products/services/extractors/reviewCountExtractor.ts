
/**
 * Extract review count with enhanced validation and additional paths
 */
export function extractReviewCount(product: any): number | null {
  // Log the product's review count-related information for debugging
  console.log(`📊 Review count data for "${product.title?.substring(0, 20) || 'Unknown'}":`, {
    ratingsTotal: product.ratings_total,
    reviewsTotal: product.reviews_total,
    reviewsCount: product.reviews_count,
    reviewsArray: Array.isArray(product.reviews) ? product.reviews.length : 'Not an array',
    ratingCount: product.rating_count,
    reviewCount: product.review_count
  });
  
  // First check: ratings_total property (most common in Amazon data)
  if (product.ratings_total !== undefined) {
    if (typeof product.ratings_total === 'number') {
      return product.ratings_total;
    }
    
    if (typeof product.ratings_total === 'string' && product.ratings_total.trim() !== '') {
      // Remove commas and try to parse
      const cleanValue = product.ratings_total.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
      
      // Try to extract numeric value, e.g., "1,234 reviews" -> 1234
      const countMatch = product.ratings_total.match(/(\d[\d,]*)/);
      if (countMatch) {
        return parseInt(countMatch[1].replace(/,/g, ''));
      }
    }
  }
  
  // Second check: reviews_total property
  if (product.reviews_total !== undefined) {
    if (typeof product.reviews_total === 'number') {
      return product.reviews_total;
    }
    
    if (typeof product.reviews_total === 'string' && product.reviews_total.trim() !== '') {
      // Remove commas and try to parse
      const cleanValue = product.reviews_total.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  // Third check: reviews_count property
  if (product.reviews_count !== undefined) {
    if (typeof product.reviews_count === 'number') {
      return product.reviews_count;
    }
    
    if (typeof product.reviews_count === 'string' && product.reviews_count.trim() !== '') {
      const cleanValue = product.reviews_count.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  // Fourth check: rating_count or review_count property
  if (product.rating_count !== undefined) {
    if (typeof product.rating_count === 'number') {
      return product.rating_count;
    }
    
    if (typeof product.rating_count === 'string' && product.rating_count.trim() !== '') {
      const cleanValue = product.rating_count.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  if (product.review_count !== undefined) {
    if (typeof product.review_count === 'number') {
      return product.review_count;
    }
    
    if (typeof product.review_count === 'string' && product.review_count.trim() !== '') {
      const cleanValue = product.review_count.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  // Fifth check: if rating is an object with count properties
  if (product.rating && typeof product.rating === 'object') {
    // Try rating.count
    if (product.rating.count !== undefined) {
      if (typeof product.rating.count === 'number') {
        return product.rating.count;
      }
      
      if (typeof product.rating.count === 'string' && product.rating.count.trim() !== '') {
        const cleanValue = product.rating.count.replace(/,/g, '');
        const parsedCount = parseInt(cleanValue);
        if (!isNaN(parsedCount)) {
          return parsedCount;
        }
      }
    }
    
    // Try rating.total_count
    if (product.rating.total_count !== undefined) {
      if (typeof product.rating.total_count === 'number') {
        return product.rating.total_count;
      }
      
      if (typeof product.rating.total_count === 'string' && product.rating.total_count.trim() !== '') {
        const cleanValue = product.rating.total_count.replace(/,/g, '');
        const parsedCount = parseInt(cleanValue);
        if (!isNaN(parsedCount)) {
          return parsedCount;
        }
      }
    }
  }
  
  // Sixth check: count reviews array if it exists
  if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
    return product.reviews.length;
  }
  
  // Return null instead of a fake review count
  return null;
}
