
/**
 * Product filtering utilities for removing duplicate ASINs 
 * and products with forbidden keywords in titles
 */

// List of keywords that indicate a product is not a laptop
const FORBIDDEN_KEYWORDS = [
  // Accessories and peripherals
  "Charger Block", "Battery Replacement", "Replacement Laptop", "Stylus", "Mouse",
  "Messenger Case", "Protective Case", "Protective Sleeve", "Laptop Battery",
  "Laptop Charger", "Headset", "Laptop Skin", "Mouse Pro", "Bag",
  "External Hard Drive", "Power Adapter", "Mouse", "Headset", "Laptop Stand",
  "Magic Keyboard", "Backpack", "Cooling pad", "External Enclosure", "Display Panel",
  "Surface dock", "Surface docking", "Screen Extender", "Earbuds", "Screen Replacement",
  "dock triple", "Bagpacks", "Bagoack", "Memory kit", "Soundbar", "Laptop AC Adapter",
  "CPU FAN", "Replacement Keyboards", "Power Cord Cable", "Charging Cable",
  "Hoodies", "Protector Cover", "Women's", "Women", "Pad Protector",
  "Feet Replacement", "Sync Cable", "Insulation Wrapping", "Replacement Memory Ram",
  "Cord Cable", "Screen Protector", "Charging Adapter", "Jack Connector", 
  "Wireless Mouse", "Rubber Feet Replacement", "PortChanger", "Touchpad protector", 
  "Touch pad protector", "Touch pad film protector", "Rubber Feet", "Laptop Sleeve", 
  "Over-ear", "Computer Keyboard", "Docking Station", "Webcam for PC",
  "External CD", "External DVD", "BDXL", "Printer Ink",
  
  // Charger-related keywords (commonly mixed with laptops)
  "Charger fit", "Charger for", "Charger Fit For", "Adapter Laptop Charger",
  "Adapter Charger", "Laptop Super Charger", "Car Charger", "Charger Replacement",
  "Charger", "Charger:", "Adapter", "Car Jump", "Battery Jump",
  
  // Smartphone keywords (commonly mixed in with laptop searches)
  "P40 Pro 5G", "P30 Pro",
  
  // Specific hardware parts (not full laptops)
  "Cooling fan replacement", "Laptop Bottom Base Case", "PIN LCD Display",
  
  // Books and media
  "Seniors Guide", "Drive Player", "Portable DVD Writer",
  
  // Vague/non-laptop descriptors
  "Jump Starter", "New 90%"
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
 * Check if a product has "iPad" in the model name
 * 
 * @param model Product model to check
 * @returns true if the model contains "iPad"
 */
export const isIPad = (model: string | undefined): boolean => {
  if (!model) return false;
  return model.toLowerCase().includes('ipad');
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
 * Filter products to remove iPads based on model name
 * 
 * @param products Array of products to filter
 * @returns Array of products without iPad models
 */
export const filterOutIPads = <T extends { model?: string }>(products: T[]): T[] => {
  return products.filter(product => !isIPad(product.model));
};

/**
 * Apply all filtering rules to a list of products
 * 
 * @param products Array of products to filter
 * @returns Filtered products
 */
export const applyAllProductFilters = <T extends { asin: string; title?: string; model?: string; last_checked?: string }>(
  products: T[]
): T[] => {
  // First remove products with forbidden keywords
  const keywordFiltered = filterProductsByKeywords(products);
  
  // Then filter out iPad models
  const withoutIPads = filterOutIPads(keywordFiltered);
  
  // Then deduplicate ASINs
  return deduplicateProductsByAsin(withoutIPads);
};
