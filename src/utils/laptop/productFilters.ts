
/**
 * Check if a title contains forbidden keywords
 * Moved from supabase functions to client-side for consistent filtering
 */

// List of keywords that indicate a product is not a laptop
const FORBIDDEN_KEYWORDS = [
  'case', 'sleeve', 'bag', 'backpack', 'skin', 'protector', 'cover',
  'charger', 'adapter', 'cable', 'cord', 'power supply',
  'mouse', 'mousepad',
  'stand', 'dock', 'docking station', 'hub', 'port',
  'screen protector', 'privacy filter',
  'ram upgrade', 'memory upgrade', 'ssd upgrade',
  'replacement screen', 'replacement battery', 'replacement keyboard',
  'parts', 'repair', 'toolkit', 'cooling pad',
  // Additional keywords from productFilters.ts
  'imac', 'Laptop Hard Drive', 'Subscription', 'Redmi Pad', 'Mini PC', 'Desktop',
  'Ipad Air',
  'Keyboard cover', 'Privacy Screen For', 'Handheld Dock', 'Charging Station',
  'Charger fit', 'Charger for', 'Charger Fit For', 'Adapter Laptop Charger',
  'Adapter Charger', 'Laptop Super Charger', 'Car Charger', 'Charger Replacement',
  'Charger', 'Charger:', 'Adapter', 'Car Jump', 'Battery Jump',
  'P40 Pro 5G', 'P30 Pro',
  'Cooling fan replacement', 'Laptop Bottom Base Case', 'PIN LCD Display',
  'Seniors Guide', 'Drive Player', 'Portable DVD Writer',
  'Jump Starter', 'New 90%',
  // New additions
  'tablet', 'accessory', 'replacement part', 'portable monitor', 'pc case',
  'hard drive enclosure', 'external cd', 'usb hub',
  // Additional keywords to catch more non-laptop items
  'power bank', 'external battery', 'wireless earbuds', 'headset', 'headphones',
  'office chair', 'desk lamp', 'desk pad', 'desk mat',
  'monitor stand', 'monitor arm', 'laptop cooler', 'cooling tray',
  'dust cover', 'waterproof cover', 'protection film',
  'laptop skin', 'sticker set', 'laptop sticker',
  'screen wipe', 'cleaning kit', 'keyboard protector',
  'port replicator', 'kvm switch', 'thunderbolt dock',
  'laptop table', 'lap desk', 'laptop pillow',
  'laptop accessories bundle', 'laptop kit', 'laptop fan',
  'laptop memory', 'laptop ram only', 'ram stick',
  'memory module',
  'New Laptop Battery'
  // Removed: 'compatible with', 'fits for', 'made for', 'replacement for'
  // Removed by user request: 'keyboard', 'touchpad', 'speaker', 'decal'
];

/**
 * Check if a title contains any forbidden keywords
 * @param title Product title to check
 * @returns True if the title contains any forbidden keywords
 */
export function containsForbiddenKeywords(title: string): boolean {
  if (!title) return false;
  
  const lowerTitle = title.toLowerCase();
  
  // Enhanced check: look for exact word matches or phrase matches
  return FORBIDDEN_KEYWORDS.some(keyword => {
    // For multi-word keywords, check if the title includes the exact phrase
    if (keyword.includes(' ')) {
      return lowerTitle.includes(keyword.toLowerCase());
    }
    
    // For single-word keywords, use word boundary check to ensure we're matching whole words
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
    return regex.test(lowerTitle);
  });
}

/**
 * Apply all product filters to an array of products
 * @param products Array of products to filter
 * @returns Filtered array of products without forbidden keywords in titles
 */
export function applyAllProductFilters(products: any[]): any[] {
  // Apply the forbidden keyword filter strictly on the title field only
  return products.filter(product => {
    if (!product.title) return true; // If no title, pass the filter
    return !containsForbiddenKeywords(product.title);
  });
}
