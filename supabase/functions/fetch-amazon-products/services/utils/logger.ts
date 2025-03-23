
/**
 * Logging utilities for product data
 */
export function logProductData(sampleProduct: any) {
  console.log("📊 RapidAPI product structure sample:", {
    hasRating: !!sampleProduct.rating,
    ratingType: typeof sampleProduct.rating,
    ratingValue: sampleProduct.rating,
    hasRatingsTotal: !!sampleProduct.ratings_total,
    ratingsTotalType: typeof sampleProduct.ratings_total,
    ratingsTotalValue: sampleProduct.ratings_total,
    availableRatingFields: Object.keys(sampleProduct).filter(key => 
      key.includes('rating') || key.includes('review') || key.includes('stars')
    ),
    firstLevelKeys: Object.keys(sampleProduct)
  });
}
