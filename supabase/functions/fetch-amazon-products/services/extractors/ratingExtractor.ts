
/**
 * Extract rating with enhanced validation and additional paths
 */
export function extractRating(product: any): number | null {
  // Log the product's rating-related information for debugging
  console.log(`⭐ Rating data for "${product.title?.substring(0, 20) || 'Unknown'}":`, {
    directRating: product.rating,
    ratingType: typeof product.rating,
    starsProperty: product.stars,
    ratingObj: product.rating_breakdown?.stars_average,
    ratingValue: product.rating?.value,
    averageRating: product.average_rating
  });
  
  // First check: direct rating property (most common)
  if (product.rating !== undefined && product.rating !== null) {
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
      
      // Try to extract from "4.5 out of 5 stars" format
      const ratingMatch = product.rating.match(/(\d+(\.\d+)?)/);
      if (ratingMatch) {
        return parseFloat(ratingMatch[1]);
      }
    }
    
    // Case: rating is an object with a value property
    if (typeof product.rating === 'object' && product.rating !== null) {
      if (typeof product.rating.value === 'number' && !isNaN(product.rating.value)) {
        return product.rating.value;
      }
      
      if (typeof product.rating.rating === 'number' && !isNaN(product.rating.rating)) {
        return product.rating.rating;
      }
      
      // Try string parsing for objects
      if (typeof product.rating.value === 'string' && product.rating.value.trim() !== '') {
        const parsedValue = parseFloat(product.rating.value);
        if (!isNaN(parsedValue)) {
          return parsedValue;
        }
      }
    }
  }
  
  // Second check: stars property
  if (product.stars !== undefined && product.stars !== null) {
    if (typeof product.stars === 'number' && !isNaN(product.stars)) {
      return product.stars;
    }
    
    if (typeof product.stars === 'string' && product.stars.trim() !== '') {
      const parsedStars = parseFloat(product.stars);
      if (!isNaN(parsedStars)) {
        return parsedStars;
      }
      
      // Try to extract just the number part
      const starsMatch = product.stars.match(/(\d+(\.\d+)?)/);
      if (starsMatch) {
        return parseFloat(starsMatch[1]);
      }
    }
  }
  
  // Third check: rating breakdown
  if (product.rating_breakdown?.stars_average) {
    const parsedStars = parseFloat(product.rating_breakdown.stars_average);
    if (!isNaN(parsedStars)) {
      return parsedStars;
    }
  }
  
  // Fourth check: average_rating property
  if (product.average_rating !== undefined && product.average_rating !== null) {
    if (typeof product.average_rating === 'number' && !isNaN(product.average_rating)) {
      return product.average_rating;
    }
    
    if (typeof product.average_rating === 'string' && product.average_rating.trim() !== '') {
      const parsedRating = parseFloat(product.average_rating);
      if (!isNaN(parsedRating)) {
        return parsedRating;
      }
    }
  }
  
  // If all attempts fail, return null (instead of a fake rating)
  return null;
}
