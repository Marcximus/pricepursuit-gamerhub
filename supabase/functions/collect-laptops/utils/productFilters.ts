
// List of keywords that indicate a product is not a laptop
const FORBIDDEN_KEYWORDS = [
  'case', 'sleeve', 'bag', 'backpack', 'skin', 'protector', 'cover',
  'charger', 'adapter', 'cable', 'cord', 'power supply',
  'keyboard', 'mouse', 'touchpad', 'mousepad',
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
  'speaker', 'office chair', 'desk lamp', 'desk pad', 'desk mat',
  'monitor stand', 'monitor arm', 'laptop cooler', 'cooling tray',
  'dust cover', 'waterproof cover', 'protection film',
  'laptop skin', 'decal', 'sticker set', 'laptop sticker',
  'screen wipe', 'cleaning kit', 'keyboard protector',
  'port replicator', 'kvm switch', 'thunderbolt dock',
  'laptop table', 'lap desk', 'laptop pillow',
  'laptop accessories bundle', 'laptop kit', 'laptop fan',
  'laptop memory', 'laptop ram only', 'ram stick',
  'memory module', 'compatible with', 'fits for',
  'made for', 'replacement for'
];

/**
 * Check if a title contains any forbidden keywords
 * @param title Product title to check
 * @returns True if the title contains any forbidden keywords
 */
export function containsForbiddenKeywords(title: string): boolean {
  if (!title) return false;
  
  const lowerTitle = title.toLowerCase();
  
  // Check if title contains any forbidden keywords
  return FORBIDDEN_KEYWORDS.some(keyword => 
    lowerTitle.includes(keyword.toLowerCase())
  );
}

/**
 * Apply all product filters to an array of products
 * @param products Array of products to filter
 * @returns Filtered array of products without forbidden keywords in titles
 */
export function applyAllProductFilters(products: any[]): any[] {
  // Filter out products with forbidden keywords in their titles
  return products.filter(product => !containsForbiddenKeywords(product.title || ''));
}
