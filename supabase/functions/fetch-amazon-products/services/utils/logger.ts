
/**
 * Logging utilities for Amazon product processing
 */

/**
 * Safely stringify objects for logging, handling circular references
 */
export function safeStringify(obj: any, indent = 2): string {
  let cache: any[] = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "object" && value !== null
        ? cache.includes(value)
          ? "[Circular]"
          : cache.push(value) && value
        : value,
    indent
  );
  cache = null as any;
  return retVal;
}

/**
 * Log product data in a structured format for debugging
 */
export function logProductData(product: any): void {
  console.log(`🔍 PRODUCT DATA STRUCTURE: ${safeStringify({
    id: product.asin || product.id,
    title: product.title?.substring(0, 30) + '...' || 'No title',
    availableKeys: Object.keys(product).sort(),
    priceInfo: product.price ? {
      type: typeof product.price,
      sample: safeStringify(product.price).substring(0, 100)
    } : 'No price',
    ratingInfo: product.rating ? {
      value: product.rating,
      totalCount: product.ratings_total || product.ratingsTotal
    } : 'No rating'
  })}`);
}
