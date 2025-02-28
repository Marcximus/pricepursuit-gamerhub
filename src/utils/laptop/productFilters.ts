
// Add iPad to the list of forbidden keywords
const FORBIDDEN_KEYWORDS = [
  'screen protector',
  'keyboard',
  'mouse',
  'case',
  'bag',
  'power bank',
  'charger',
  'adapter',
  'dock',
  'docking station',
  'stand',
  'cooling pad',
  'webcam',
  'monitor',
  'tablet', 
  'smartphone',
  'phone',
  'projector',
  'iPad', // Add iPad to the forbidden keywords
];

// Check if a title contains any forbidden keywords
export const containsForbiddenKeywords = (title: string | null | undefined): boolean => {
  if (!title) return false;
  
  const titleLower = title.toLowerCase();
  return FORBIDDEN_KEYWORDS.some(keyword => 
    titleLower.includes(keyword.toLowerCase())
  );
};

// Check if a product is valid based on a variety of filters
export const isValidLaptopProduct = (product: any): boolean => {
  // Skip products without a title
  if (!product.title) return false;
  
  // Skip products with forbidden keywords
  if (containsForbiddenKeywords(product.title)) return false;
  
  // Skip products with model containing "iPad"
  if (product.model && product.model.toLowerCase().includes('ipad')) return false;
  
  // Skip products without a price
  if (!product.current_price) return false;
  
  // Skip products with unrealistic prices
  if (product.current_price < 100 || product.current_price > 15000) return false;
  
  return true;
};

// Apply all product filters to a collection of products
export const applyAllProductFilters = (products: any[]): any[] => {
  if (!products || !Array.isArray(products)) return [];
  
  // First filter out products that don't meet the basic criteria
  const validProducts = products.filter(isValidLaptopProduct);
  
  // Filter out duplicate ASINs
  const seenAsins = new Set<string>();
  return validProducts.filter(product => {
    if (!product.asin) return true;
    
    if (seenAsins.has(product.asin)) {
      return false; // Skip duplicates
    }
    
    seenAsins.add(product.asin);
    return true;
  });
};
