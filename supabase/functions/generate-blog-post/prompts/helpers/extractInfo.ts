
/**
 * Helper functions to extract information from titles and product data
 * These are used by the prompt generators to get relevant details for the AI
 */

/**
 * Extract brand information from a product title
 * @param title The product title
 * @returns Brand name or empty string if not found
 */
export function extractBrandFromTitle(title: string): string {
  if (!title) return '';
  
  // List of common laptop brands to look for
  const commonBrands = [
    'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Apple', 
    'Samsung', 'Microsoft', 'Razer', 'Toshiba', 'LG', 'Gigabyte',
    'Alienware', 'Huawei', 'CHUWI', 'Gateway'
  ];
  
  // Check for explicit mentions of these brands
  for (const brand of commonBrands) {
    // Use word boundary to avoid partial matches
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    if (regex.test(title)) {
      return brand;
    }
  }
  
  return '';
}

/**
 * Extract hardware specifications from product title
 * @param title The product title
 * @param type Type of information to extract (processor, ram, storage, etc.)
 * @returns Extracted information or empty string if not found
 */
export function extractInfoFromTitle(title: string, type: 'processor' | 'ram' | 'storage' | 'graphics' | 'screen'): string {
  if (!title) return '';
  
  // Convert title to lowercase for easier matching
  const titleLower = title.toLowerCase();
  
  switch (type) {
    case 'processor':
      // Match Intel or AMD processors
      const processorMatch = titleLower.match(/\b(i3|i5|i7|i9|intel|ryzen|r3|r5|r7|r9|amd)[\s-]?(\d{3,4}[a-z]*)?/);
      return processorMatch ? processorMatch[0] : '';
      
    case 'ram':
      // Match RAM configurations (e.g., 8GB, 16 GB, etc.)
      const ramMatch = titleLower.match(/\b(\d{1,3})[\s]?(?:gb|gigs?)[\s](?:ram|memory)\b/);
      return ramMatch ? ramMatch[0] : '';
      
    case 'storage':
      // Match storage configurations (e.g., 256GB SSD, 1TB, etc.)
      const storageMatch = titleLower.match(/\b(\d{3,4})[\s]?(?:gb|tb)[\s]?(?:ssd|hdd|storage|nvme)\b/);
      return storageMatch ? storageMatch[0] : '';
      
    case 'graphics':
      // Match graphics cards (e.g., RTX 3050, Intel Iris, etc.)
      const graphicsMatch = titleLower.match(/\b(rtx|gtx|nvidia|amd|radeon|iris)\s?(\d{3,4})?(?:\s?ti)?\b/);
      return graphicsMatch ? graphicsMatch[0] : '';
      
    case 'screen':
      // Match screen sizes (e.g., 15.6-inch, 13", etc.)
      const screenMatch = titleLower.match(/\b(\d{2}\.?\d?)[\s-]?(?:inch|"|in|inches)\b/);
      return screenMatch ? screenMatch[0] : '';
      
    default:
      return '';
  }
}

/**
 * Helper to extract info for use in ProductData interface
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
