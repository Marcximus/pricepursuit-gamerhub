
/**
 * Extract rating with validation
 */
export function extractRating(content: any): number | null {
  if (content.rating && typeof content.rating === 'number' && content.rating > 0) {
    return content.rating;
  }
  
  return null;
}

/**
 * Extract review count
 */
export function extractReviewCount(content: any): number | null {
  if (content.reviews_count && typeof content.reviews_count === 'number') {
    return content.reviews_count;
  }
  
  return content.reviews?.length || 0;
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
