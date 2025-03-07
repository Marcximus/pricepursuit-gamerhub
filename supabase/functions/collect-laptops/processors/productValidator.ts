
import { containsForbiddenKeywords } from "../utils/productFilters.ts";

/**
 * Validates and filters products to ensure they're laptops
 * @param products Raw product data array
 * @param brand Brand name
 * @param detailedLogging Whether to log detailed information
 * @returns Filtered array of laptop products
 */
export function validateAndFilterProducts(products: any[], brand: string, detailedLogging = false): any[] {
  // Validate input
  if (!products || !Array.isArray(products)) {
    console.error(`Invalid products array for brand ${brand}:`, products);
    return [];
  }
  
  console.log(`Validating ${products.length} products for brand ${brand}`);
  
  // Filter out non-laptop products by checking titles
  const laptopProducts = products.filter(product => {
    // Skip products with completely empty titles
    if (!product.title || product.title.trim() === '') {
      if (detailedLogging) {
        console.log(`Filtering out product with empty title`);
      }
      return false;
    }
    
    const title = product.title.toLowerCase();
    
    // Keywords that indicate the product is likely a laptop - expanded list
    const laptopKeywords = [
      'laptop', 'notebook', 'ultrabook', 'chromebook', 'gaming laptop', 'macbook',
      'thinkpad', 'ideapad', 'yoga', 'envy', 'pavilion', 'spectre', 'xps', 
      'inspiron', 'surface', 'vivobook', 'zenbook'
    ];
    
    // Keywords that indicate the product is NOT a laptop
    const nonLaptopKeywords = [
      'laptop stand', 'laptop bag', 'laptop sleeve', 'laptop backpack', 'laptop case',
      'laptop mount', 'laptop desk', 'laptop tray', 'laptop battery', 'laptop screen protector',
      'laptop charger', 'laptop cooler', 'laptop cooling pad', 'laptop skin', 'laptop sticker',
      'laptop accessory', 'laptop power adapter', 'laptop cart', 'laptop table', 'laptop riser'
    ];
    
    // Strictly check the title for forbidden keywords
    const hasForbiddenKeywords = containsForbiddenKeywords(product.title || '');
    
    // More lenient check - product is considered a laptop if it has any laptop keywords
    // and doesn't have non-laptop keywords or forbidden keywords
    const isLaptop = 
      laptopKeywords.some(keyword => title.includes(keyword)) && 
      !nonLaptopKeywords.some(keyword => title.includes(keyword)) &&
      !hasForbiddenKeywords;
    
    if (detailedLogging && !isLaptop) {
      console.log(`Filtering out non-laptop: "${title}"`);
    }
    
    return isLaptop;
  });
  
  console.log(`Filtered to ${laptopProducts.length} laptop products out of ${products.length} total products`);
  
  return laptopProducts;
}
