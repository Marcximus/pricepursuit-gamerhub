
/**
 * Transforms raw product data into a structured format for database insertion
 * @param product Raw product data
 * @param brand Brand name
 * @returns Processed product object or null if invalid
 */
export function transformProductData(product: any, brand: string): any | null {
  try {
    // Basic validation
    if (!product.asin) {
      return null;
    }

    // Extract and normalize product data
    return {
      asin: product.asin,
      title: product.title || '',
      description: product.description || '',
      current_price: extractPrice(product.price_information),
      original_price: extractOriginalPrice(product.price_information),
      rating: product.rating?.value || null,
      rating_count: product.rating?.count || null,
      image_url: product.image || '',
      product_url: product.url || '',
      category: product.category || '',
      brand: brand, // Use the brand passed as argument
      is_laptop: true // Mark as laptop
    };
  } catch (err) {
    console.error(`Error transforming product data: ${err.message}`, err);
    return null;
  }
}

/**
 * Extracts the current price from price information
 * @param priceInfo Price information object
 * @returns Extracted price as number or null
 */
export function extractPrice(priceInfo: any): number | null {
  try {
    if (!priceInfo) return null;
    
    // Try to get the current price
    if (priceInfo.current_price) {
      // Remove currency symbol and convert to number
      const priceStr = String(priceInfo.current_price).replace(/[^0-9.]/g, '');
      return Number(priceStr) || null;
    }
    
    return null;
  } catch (e) {
    console.error('Error extracting price:', e);
    return null;
  }
}

/**
 * Extracts the original price from price information
 * @param priceInfo Price information object
 * @returns Extracted original price as number or null
 */
export function extractOriginalPrice(priceInfo: any): number | null {
  try {
    if (!priceInfo || !priceInfo.previous_price) return null;
    
    // Remove currency symbol and convert to number
    const priceStr = String(priceInfo.previous_price).replace(/[^0-9.]/g, '');
    return Number(priceStr) || null;
  } catch (e) {
    console.error('Error extracting original price:', e);
    return null;
  }
}
