
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
  'hard drive enclosure', 'external cd', 'webcam', 'usb hub'
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
