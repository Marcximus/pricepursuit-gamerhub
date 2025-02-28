
/**
 * Product filtering utilities for removing duplicate ASINs 
 * and products with forbidden keywords in titles
 */

// List of keywords that indicate a product is not a laptop
const FORBIDDEN_KEYWORDS = [
  "Charger Block", "Battery Replacement", "Replacement Laptop", "Stylus", "Mouse",
  "Messenger Case", "Protective Case", "Protective Sleeve", "Laptop Battery",
  "Laptop Charger", "Car Jump", "Headset", "Laptop Skin", "Charger Fit For",
  "Adapter Laptop Charger", "Mouse Pro", "Charger fit", "Charger for", "Bag",
  "External Hard Drive", "Power Adapter", "Mouse", "Jump Starter", "Battery Jump",
  "Headset", "Laptop Stand", "Magic Keyboard", "Laptop Super Charger", "Backpack",
  "Cooling pad", "External Enclosure", "Display Panel", "Cable for", "Surface dock",
  "Surface docking", "Screen Extender", "Earbuds", "Screen Replacement", "dock triple",
  "Bagpacks", "Bagoack", "Memory kit", "Soundbar", "Laptop AC Adapter",
  "Cooling fan replacement", "Laptop Bottom Base Case", "CPU FAN", "Replacement Keyboards",
  "Car Charger", "Adapter", "PIN LCD Display", "Power Cord Cable", "Charging Cable",
  "Laptop Charger", "Hoodies", "Protector Cover", "Women's", "Women", "Pad Protector",
  "Feet Replacement", "Charger for", "Sync Cable", "Insulation Wrapping", 
  "Replacement Memory Ram", "Cord Cable", "Screen Protector", "Charging Adapter",
  "Jack Connector", "Adapter Charger", "Wireless Mouse", "Rubber Feet Replacement",
  "PortChanger", "Touchpad protector", "Touch pad protector", "Touch pad film protector",
  "Charger Replacement", "Rubber Feet", "Laptop Sleeve", "Over-ear", "Laptop Charger",
  "New 90%", "Portable DVD Writer",
  // Added new forbidden keywords
  "Ipad", "Charger", "Charger:", "P40 Pro 5G", "Printer Ink", "Docking Station",
  "Seniors Guide", "P30 Pro", "Webcam for PC", "Drive Player", "External CD",
  "External DVD", "BDXL"
];

/**
 * Check if a product title contains any forbidden keywords
 * 
 * @param title Product title to check
 * @returns true if the title contains any forbidden keywords
 */
export const containsForbiddenKeywords = (title: string): boolean => {
  if (!title) return false;
  
  const normalizedTitle = title.toLowerCase();
  
  return FORBIDDEN_KEYWORDS.some(keyword => 
    normalizedTitle.includes(keyword.toLowerCase())
  );
};

/**
 * Filter products to remove those with forbidden keywords in their titles
 * 
 * @param products Array of products to filter
 * @returns Array of products without forbidden keywords in titles
 */
export const filterProductsByKeywords = <T extends { title?: string }>(products: T[]): T[] => {
  return products.filter(product => !containsForbiddenKeywords(product.title || ''));
};

/**
 * Remove duplicate ASINs from an array of products, keeping the most recent one
 * 
 * @param products Array of products to deduplicate
 * @returns Array of products with unique ASINs
 */
export const deduplicateProductsByAsin = <T extends { asin: string; last_checked?: string }>(products: T[]): T[] => {
  const uniqueProducts = new Map<string, T>();
  
  // Process products in order, potentially overwriting with more recent ones
  for (const product of products) {
    const existingProduct = uniqueProducts.get(product.asin);
    
    // If this ASIN doesn't exist yet in our map, or if this product is more recent, use it
    if (!existingProduct || (product.last_checked && existingProduct.last_checked && 
        new Date(product.last_checked) > new Date(existingProduct.last_checked))) {
      uniqueProducts.set(product.asin, product);
    }
  }
  
  return Array.from(uniqueProducts.values());
};

/**
 * Apply all filtering rules to a list of products
 * 
 * @param products Array of products to filter
 * @returns Filtered products
 */
export const applyAllProductFilters = <T extends { asin: string; title?: string; last_checked?: string }>(
  products: T[]
): T[] => {
  // First remove products with forbidden keywords
  const keywordFiltered = filterProductsByKeywords(products);
  
  // Then deduplicate ASINs
  return deduplicateProductsByAsin(keywordFiltered);
};
