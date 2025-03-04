
/**
 * Basic graphics matcher utilities
 */

// Helper function to check if GPU is in "Other Graphics" category
export const isOtherGraphics = (
  productFilterValue: string,
  mainCategories: string[]
): boolean => {
  // If the product's filter value is a common category, don't include it in "Other"
  if (mainCategories.includes(productFilterValue)) {
    return false;
  }
  
  // Check if it matches the more general GPU types - exclude these from "Other"
  if (productFilterValue === 'High Performance GPU' || 
      productFilterValue === 'Integrated GPU' || 
      productFilterValue === 'Dedicated GPU') {
    return false;
  }
  
  // Include in "Other" if it doesn't match any main category
  return true;
};

// Main graphics categories that shouldn't be included in "Other"
export const mainGraphicsCategories: string[] = [
  // NVIDIA RTX 40 series
  'NVIDIA RTX 4090', 'NVIDIA RTX 4080', 'NVIDIA RTX 4070', 
  'NVIDIA RTX 4060', 'NVIDIA RTX 4050',
  
  // NVIDIA RTX 30 series
  'NVIDIA RTX 3090', 'NVIDIA RTX 3080', 'NVIDIA RTX 3070', 
  'NVIDIA RTX 3060', 'NVIDIA RTX 3050',
  
  // NVIDIA RTX 20 series
  'NVIDIA RTX 2080', 'NVIDIA RTX 2070', 'NVIDIA RTX 2060',
  
  // NVIDIA GTX series - expanded to include more models
  'NVIDIA GTX 1660', 'NVIDIA GTX 1650', 'NVIDIA GTX 1060', 'NVIDIA GTX 1070', 'NVIDIA GTX 1080',
  'NVIDIA GTX 980', 'NVIDIA GTX 970', 'NVIDIA GTX 960',
  
  // NVIDIA MX series
  'NVIDIA MX 550', 'NVIDIA MX 450', 'NVIDIA MX 350', 'NVIDIA MX 250',
  
  // AMD Radeon
  'AMD Radeon RX 7900', 'AMD Radeon RX 7800', 'AMD Radeon RX 7700', 'AMD Radeon RX 7600',
  'AMD Radeon RX 6800', 'AMD Radeon RX 6700', 'AMD Radeon RX 6600', 'AMD Radeon RX 6500',
  'AMD Radeon RX 5700', 'AMD Radeon RX 5600', 'AMD Radeon RX 5500',
  'AMD Radeon Vega',
  
  // Intel Arc discrete
  'Intel Arc A770', 'Intel Arc A750', 'Intel Arc A380',
  
  // Intel Integrated (more detailed categories)
  'Intel Iris Xe Graphics', 
  'Intel Iris Plus Graphics',
  'Intel Iris Graphics',
  'Intel UHD Graphics 700 Series',
  'Intel UHD Graphics 600 Series', 
  'Intel UHD Graphics',
  'Intel HD Graphics 500 Series',
  'Intel HD Graphics 400 Series',
  'Intel HD Graphics 300 Series',
  'Intel HD Graphics 200 Series',
  'Intel HD Graphics',
  
  // Apple
  'Apple M3 Ultra GPU', 'Apple M3 Max GPU', 'Apple M3 Pro GPU', 'Apple M3 GPU',
  'Apple M2 Ultra GPU', 'Apple M2 Max GPU', 'Apple M2 Pro GPU', 'Apple M2 GPU',
  'Apple M1 Ultra GPU', 'Apple M1 Max GPU', 'Apple M1 Pro GPU', 'Apple M1 GPU',
  
  // Generic categories
  'NVIDIA RTX Graphics', 'NVIDIA GTX Graphics', 'NVIDIA Graphics',
  'AMD Radeon Graphics',
  'Intel Graphics',
  'Apple Graphics',
];

// Common GPU brand terms for matching
export const gpuBrands = ['nvidia', 'amd', 'radeon', 'intel', 'apple', 'rtx', 'gtx'];

// Check if a product shares a brand term with a filter value
export const sharesBrandTerm = (
  filterLower: string,
  productLower: string
): boolean => {
  return gpuBrands.some(brand => 
    filterLower.includes(brand) && productLower.includes(brand)
  );
};

// Check if all filter words are contained in the product
export const containsAllFilterWords = (
  filterLower: string,
  productLower: string
): boolean => {
  const filterWords = filterLower.split(/\s+/);
  return filterWords.every(word => productLower.includes(word));
};
