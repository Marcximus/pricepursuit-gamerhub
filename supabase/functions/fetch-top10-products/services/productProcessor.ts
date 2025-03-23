
/**
 * Process all queried products to prepare for display
 * @param results Array of product results from database
 * @param count Maximum number of products to return
 * @returns Processed top products array
 */
export const processProducts = (results: any[], count: number) => {
  console.log(`🔄 Total raw results before deduplication: ${results.length} products`);
  
  // Deduplicate based on ASIN
  const uniqueMap = new Map();
  results.forEach(item => uniqueMap.set(item.asin, item));
  const uniqueProducts = Array.from(uniqueMap.values());
  
  console.log(`🧹 After deduplication: ${uniqueProducts.length} unique products`);
  
  // Sort by rating and limit to the requested count
  const topProducts = uniqueProducts
    .sort((a, b) => {
      // Primary sort by rating
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      // Secondary sort by rating count
      return (b.rating_count || 0) - (a.rating_count || 0);
    })
    .slice(0, count);
  
  console.log(`🏆 Final top ${topProducts.length} products selected`);
  
  if (topProducts.length > 0) {
    console.log(`📝 Sample product: "${topProducts[0].title.substring(0, 50)}..."`);
    console.log(`⭐ Top product rating: ${topProducts[0].rating} (${topProducts[0].rating_count} reviews)`);
  }
  
  return topProducts;
};
