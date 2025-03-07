
/**
 * Extracts and formats product features
 */

/**
 * Extract key features from product data
 * @param product The product data
 * @returns Array of feature strings
 */
export function extractFeatures(product: any): string[] {
  const features: string[] = [];
  
  // Extract from feature bullets if available
  if (product.feature_bullets && Array.isArray(product.feature_bullets)) {
    return product.feature_bullets.slice(0, 5);
  }
  
  // Extract from product specifications if available
  if (product.specifications && Array.isArray(product.specifications)) {
    return product.specifications
      .filter(spec => spec.name && spec.value)
      .map(spec => `${spec.name}: ${spec.value}`)
      .slice(0, 5);
  }
  
  // Extract from product attributes if available
  if (product.attributes && Array.isArray(product.attributes)) {
    return product.attributes
      .filter(attr => attr.name && attr.value)
      .map(attr => `${attr.name}: ${attr.value}`)
      .slice(0, 5);
  }
  
  return features;
}
