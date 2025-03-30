
/**
 * System prompt for Top10 blog post generation
 */
import { extractInfoFromTitle, extractBrandFromTitle } from './helpers/extractInfo.ts';
import { getDefaultTop10Prompt } from './templates/defaultTop10Prompt.ts';
import { getProductTop10Prompt } from './templates/productTop10Prompt.ts';

export function getTop10Prompt(products?: any[]): string {
  // Default prompt when no products are provided
  if (!products || products.length === 0) {
    return getDefaultTop10Prompt();
  }

  // Enhanced prompt when products are provided
  let productsInfo = "";
  const productCount = Math.min(products.length, 10);
  
  // Create detailed information about the available products
  for (let i = 0; i < productCount; i++) {
    const product = products[i];
    // Smart brand detection: use product.brand if available, otherwise extract from title
    const brand = product.brand || extractBrandFromTitle(product.title);
    
    // Extract processor, RAM, graphics, storage, screen size, and battery life from product data
    const processor = product.processor || extractInfoFromTitle(product.title, 'processor');
    const ram = product.ram || extractInfoFromTitle(product.title, 'ram');
    const graphics = product.graphics || extractInfoFromTitle(product.title, 'graphics');
    const storage = product.storage || extractInfoFromTitle(product.title, 'storage');
    const screenSize = product.screen_size || extractInfoFromTitle(product.title, 'screen');
    const batteryLife = product.battery_life || 'Up to 8 hours';
    
    productsInfo += `\nProduct ${i+1}:
- Title: ${product.title || 'Unknown'}
- Brand: ${brand}
- Model: ${product.model || product.title?.split(' ').slice(1, 3).join(' ') || 'Unknown'}
- Price: ${product.price || 'Unknown'}
- Rating: ${product.rating || 'No ratings'} (${product.ratings_total || 0} reviews)
- ASIN: ${product.asin || 'Unknown'}
- CPU: ${processor || 'Unknown'}
- RAM: ${ram || 'Unknown'}
- Graphics: ${graphics || 'Unknown'}
- Storage: ${storage || 'Unknown'}
- Screen: ${screenSize || 'Unknown'}
- Battery: ${batteryLife || 'Unknown'}
- Key Features: ${product.features?.slice(0, 3).join(', ') || 'High performance, reliability, good value'}\n`;
  }

  return getProductTop10Prompt(productsInfo, productCount);
}
