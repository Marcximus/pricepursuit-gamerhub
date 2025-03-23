
/**
 * Logging utilities for product data
 */
export function logProductData(sampleProduct: any) {
  try {
    console.log("📊 FULL SAMPLE PRODUCT DATA:", JSON.stringify(sampleProduct, null, 2));
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

    // Log memory usage for debugging
    const memoryUsage = Deno.memoryUsage();
    console.log("🧠 Memory usage:", {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    });
  } catch (error) {
    console.error("❌ Error logging product data:", error);
    // Continue execution even if logging fails
  }
}

/**
 * Safe JSON stringify with circular reference handling
 * @param obj Object to stringify
 * @returns JSON string with circular references replaced with "[Circular]"
 */
export function safeStringify(obj: any): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (error) {
    return `[Error stringifying object: ${error.message}]`;
  }
}

/**
 * Log request or response object with headers and body
 * @param obj Request or Response object
 * @param type "REQUEST" or "RESPONSE"
 */
export function logRequestOrResponse(obj: Request | Response, type: "REQUEST" | "RESPONSE"): void {
  try {
    const headers = Object.fromEntries(obj.headers.entries());
    console.log(`📝 ${type} HEADERS:`, safeStringify(headers));
    
    if (obj instanceof Request) {
      console.log(`📝 ${type} METHOD:`, obj.method);
      console.log(`📝 ${type} URL:`, obj.url);
    } else if (obj instanceof Response) {
      console.log(`📝 ${type} STATUS:`, obj.status, obj.statusText);
    }
  } catch (error) {
    console.error(`❌ Error logging ${type.toLowerCase()}:`, error);
  }
}
