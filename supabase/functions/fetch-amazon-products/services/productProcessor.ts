/**
 * Minimal processor for Amazon products that preserves all raw data
 */
export function processAmazonProducts(data: any) {
  if (!data.data?.products || !Array.isArray(data.data.products)) {
    console.warn("⚠️ No products found in RapidAPI response or invalid format");
    return [];
  }
  
  console.log(`✅ Received ${data.data?.products?.length || 0} products from RapidAPI`);
  
  // Simply pass through the complete raw products with minimal enhancements
  const products = data.data.products.map((product: any, index: number) => {
    return {
      ...product,
      rank: index + 1, // Keep rank property for display order
      
      // Add these properties only if they don't already exist - don't override existing values
      imageUrl: product.imageUrl || product.image || '',
      productUrl: product.productUrl || product.url || '#',
      
      // Keep original data structure intact
      _rawData: true // Flag to indicate this has raw data
    };
  });
  
  console.log(`🏁 Returning ${products.length} products with complete raw data`);
  
  // Return all products, up to 15 max to ensure we have enough data
  return products.slice(0, 15);
}
