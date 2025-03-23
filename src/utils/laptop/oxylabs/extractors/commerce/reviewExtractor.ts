
/**
 * Extract rating with validation
 */
export function extractRating(content: any): number | null {
  // First try the direct rating property
  if (content.rating) {
    if (typeof content.rating === 'number' && content.rating > 0) {
      return content.rating;
    }
    
    if (typeof content.rating === 'string') {
      const parsedRating = parseFloat(content.rating);
      if (!isNaN(parsedRating) && parsedRating > 0) {
        return parsedRating;
      }
    }
  }
  
  // Check alternative rating properties
  if (content.stars) {
    if (typeof content.stars === 'number' && content.stars > 0) {
      return content.stars;
    }
    
    if (typeof content.stars === 'string') {
      const parsedStars = parseFloat(content.stars);
      if (!isNaN(parsedStars) && parsedStars > 0) {
        return parsedStars;
      }
    }
  }
  
  // Check rating breakdown if available
  if (content.rating_breakdown?.stars_average) {
    const average = parseFloat(content.rating_breakdown.stars_average);
    if (!isNaN(average) && average > 0) {
      return average;
    }
  }
  
  return null;
}

/**
 * Extract review count
 */
export function extractReviewCount(content: any): number | null {
  // Check multiple possible properties for review count
  
  // 1. Direct reviews_count property
  if (content.reviews_count && typeof content.reviews_count === 'number') {
    return content.reviews_count;
  }
  
  // 2. ratings_total property (common in Amazon data)
  if (content.ratings_total) {
    if (typeof content.ratings_total === 'number') {
      return content.ratings_total;
    }
    
    if (typeof content.ratings_total === 'string') {
      const parsed = parseInt(content.ratings_total.replace(/,/g, ''));
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  
  // 3. reviews_total property (alternative name)
  if (content.reviews_total) {
    if (typeof content.reviews_total === 'number') {
      return content.reviews_total;
    }
    
    if (typeof content.reviews_total === 'string') {
      const parsed = parseInt(content.reviews_total.replace(/,/g, ''));
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  
  // 4. Count reviews array length if available
  if (content.reviews && Array.isArray(content.reviews)) {
    return content.reviews.length;
  }
  
  return null;
}

/**
 * Extract review data from API response
 */
export function extractReviewData(content: any): Record<string, any> | null {
  if (!content.reviews || !Array.isArray(content.reviews)) {
    return null;
  }
  
  const reviewData: Record<string, any> = {
    rating_breakdown: {},
    recent_reviews: []
  };
  
  // Process rating distribution if available
  if (content.rating_stars_distribution && Array.isArray(content.rating_stars_distribution)) {
    content.rating_stars_distribution.forEach((dist: any) => {
      if (dist && dist.key && dist.value) {
        reviewData.rating_breakdown[dist.key] = dist.value;
      }
    });
  }
  
  // Process individual reviews
  if (content.reviews.length > 0) {
    reviewData.recent_reviews = content.reviews.map((review: any) => ({
      rating: review.rating || 0,
      title: review.title || '',
      content: review.content || '',
      reviewer_name: review.reviewer_name || 'Anonymous',
      review_date: review.date || new Date().toISOString(),
      verified_purchase: review.verified_purchase || false,
      helpful_votes: review.helpful_votes || 0
    }));
  }
  
  return reviewData;
}
