
/**
 * Helper functions to extract product information for blog post generation
 */

export interface ProductData {
  title: string;
  brand?: string;
  model?: string;
  price?: number | string;
  rating?: number;
  reviewCount?: number;
  asin?: string;
  url?: string;
  imageUrl?: string;
  cpu?: string;
  ram?: string;
  graphics?: string;
  storage?: string;
  screen?: string;
  battery?: string;
  features?: string[];
}

/**
 * Extract product information from raw product data
 * @param product Raw product data object
 * @returns Formatted product data
 */
export function extractProductInfo(product: any): ProductData {
  if (!product) return { title: 'Unknown Product' };
  
  return {
    title: product.title || 'Unknown Product',
    brand: product.brand || 'Unknown',
    model: product.model || '',
    price: product.price || product.current_price || '',
    rating: product.rating || 0,
    reviewCount: product.ratings_total || product.rating_count || product.reviews_count || 0,
    asin: product.asin || '',
    url: product.url || product.productUrl || product.product_url || '',
    imageUrl: product.image || product.imageUrl || product.image_url || '',
    cpu: product.cpu || product.processor || 'Not specified',
    ram: product.ram || 'Not specified',
    graphics: product.graphics || 'Not specified',
    storage: product.storage || 'Not specified',
    screen: product.screen || product.screen_size || 'Not specified',
    battery: product.battery || product.battery_life || 'Up to 8 hours',
    features: Array.isArray(product.feature_bullets) 
      ? product.feature_bullets 
      : (Array.isArray(product.features) ? product.features : [])
  };
}

/**
 * Format product data into a detailed string for prompt generation
 * @param product Formatted product data
 * @param position Product ranking position
 * @returns String representation for prompts
 */
export function formatProductForPrompt(product: ProductData, position: number): string {
  const lines = [
    `Product ${position}:`,
    `- Title: ${product.title}`,
    `- Brand: ${product.brand || 'Unknown'}`,
    `- Model: ${product.model || 'Unknown'}`,
    `- Price: ${product.price || 'Unknown'}`,
    `- Rating: ${product.rating || 0} (${product.reviewCount || 0} reviews)`,
    `- ASIN: ${product.asin || 'Unknown'}`,
    `- CPU: ${product.cpu || 'Unknown'}`,
    `- RAM: ${product.ram || 'Unknown'}`,
    `- Graphics: ${product.graphics || 'Unknown'}`,
    `- Storage: ${product.storage || 'Unknown'}`,
    `- Screen: ${product.screen || 'Unknown'}`,
    `- Battery: ${product.battery || 'Unknown'}`,
    `- Key Features: ${(product.features && product.features.length > 0) 
      ? product.features.slice(0, 3).join(' | ') 
      : 'High performance, reliability, good value'}`
  ];
  
  return lines.join('\n');
}
