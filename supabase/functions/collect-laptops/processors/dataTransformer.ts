
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
      console.log("Skipping product without ASIN:", product.title || "Unknown");
      return null;
    }

    // Enhanced price extraction with detailed logging
    const currentPrice = extractPrice(product.price_information);
    const originalPrice = extractOriginalPrice(product.price_information);
    
    // Enhanced image extraction with validation
    let imageUrl = product.image || '';
    
    // Validate image URL format
    if (imageUrl && !imageUrl.startsWith('http')) {
      console.log(`Invalid image URL format for ${product.asin}: ${imageUrl}`);
      
      // Try to find an alternative image
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0];
        console.log(`Found alternative image URL: ${imageUrl}`);
      }
    }
    
    // Log price and image data for debugging
    console.log(`Product ${product.asin} | Title: ${product.title?.substring(0, 50) || 'Unknown'}`);
    console.log(`  Price data: current=${currentPrice}, original=${originalPrice}`);
    console.log(`  Image URL: ${imageUrl || 'None'}`);

    // Extract and normalize product data
    return {
      asin: product.asin,
      title: product.title || '',
      description: product.description || '',
      current_price: currentPrice,
      original_price: originalPrice,
      rating: product.rating?.value || null,
      rating_count: product.rating?.count || null,
      image_url: imageUrl,
      product_url: product.url || `https://www.amazon.com/dp/${product.asin}`,
      category: product.category || '',
      brand: brand, // Use the brand passed as argument
      is_laptop: true, // Mark as laptop
      update_status: 'completed', // Set initial update status
      collection_status: 'completed' // Set initial collection status
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
    if (!priceInfo) {
      console.log("No price information available");
      return null;
    }
    
    // Try to get the current price with enhanced logging
    if (priceInfo.current_price) {
      // Remove currency symbol and convert to number
      const priceStr = String(priceInfo.current_price).replace(/[^0-9.]/g, '');
      const price = Number(priceStr);
      
      if (isNaN(price)) {
        console.log(`Invalid price format: ${priceInfo.current_price}`);
        return null;
      }
      
      return price;
    } else if (priceInfo.price) {
      // Alternative price field
      const priceStr = String(priceInfo.price).replace(/[^0-9.]/g, '');
      const price = Number(priceStr);
      
      if (isNaN(price)) {
        console.log(`Invalid price format: ${priceInfo.price}`);
        return null;
      }
      
      return price;
    }
    
    console.log("No valid price field found in price information");
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
    if (!priceInfo) return null;
    
    // First try previous_price
    if (priceInfo.previous_price) {
      const priceStr = String(priceInfo.previous_price).replace(/[^0-9.]/g, '');
      const price = Number(priceStr);
      return isNaN(price) ? null : price;
    }
    
    // Then try list_price
    if (priceInfo.list_price) {
      const priceStr = String(priceInfo.list_price).replace(/[^0-9.]/g, '');
      const price = Number(priceStr);
      return isNaN(price) ? null : price;
    }
    
    // Try other common price fields
    const possibleFields = ['original_price', 'msrp', 'regular_price'];
    for (const field of possibleFields) {
      if (priceInfo[field]) {
        const priceStr = String(priceInfo[field]).replace(/[^0-9.]/g, '');
        const price = Number(priceStr);
        if (!isNaN(price)) {
          return price;
        }
      }
    }
    
    return null;
  } catch (e) {
    console.error('Error extracting original price:', e);
    return null;
  }
}
