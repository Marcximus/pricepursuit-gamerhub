
import { normalizeGraphics, getGraphicsFilterValue, isIntegratedGraphics, isHighPerformanceGraphics } from "@/utils/laptop/normalizers/graphics";
import { matchesNvidiaGraphics } from './nvidiaMatcher';
import { matchesAmdGraphics } from './amdMatcher';
import { matchesIntelGraphics } from './intelMatcher';
import { matchesAppleGraphics } from './appleMatcher';

/**
 * Enhanced matcher for graphics card filter values with improved accuracy
 */
export const matchesGraphicsFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Special case for "Other Graphics" category
  if (filterValue === 'Other Graphics') {
    // Normalize the product value
    const normalizedProduct = normalizeGraphics(productValue);
    if (!normalizedProduct) return false;
    
    // Get the filter value for the product
    const productFilterValue = getGraphicsFilterValue(normalizedProduct);
    
    // Define the main graphics categories that shouldn't be included in "Other"
    const mainCategories = [
      // NVIDIA RTX 40 series
      'NVIDIA RTX 4090', 'NVIDIA RTX 4080', 'NVIDIA RTX 4070', 
      'NVIDIA RTX 4060', 'NVIDIA RTX 4050',
      
      // NVIDIA RTX 30 series
      'NVIDIA RTX 3090', 'NVIDIA RTX 3080', 'NVIDIA RTX 3070', 
      'NVIDIA RTX 3060', 'NVIDIA RTX 3050',
      
      // NVIDIA RTX 20 series
      'NVIDIA RTX 2080', 'NVIDIA RTX 2070', 'NVIDIA RTX 2060',
      
      // NVIDIA GTX series
      'NVIDIA GTX 1660', 'NVIDIA GTX 1650',
      
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
  }
  
  // Normalize both filter and product values for consistency
  const normalizedProduct = normalizeGraphics(productValue);
  
  // Skip matching if the normalized product value is excessively long (likely invalid)
  // or if it's empty after normalization
  if (normalizedProduct.length > 50 || normalizedProduct.length === 0) {
    return false;
  }
  
  // Get category-based filter values for better matching
  const productFilterValue = getGraphicsFilterValue(normalizedProduct);
  
  // Primary case: direct category match
  if (productFilterValue.toLowerCase() === filterValue.toLowerCase()) {
    return true;
  }
  
  // Special filter case: "High Performance GPU"
  if (filterValue.toLowerCase() === 'high performance gpu' && 
      isHighPerformanceGraphics(normalizedProduct)) {
    return true;
  }
  
  // Special filter case: "Integrated GPU"
  if (filterValue.toLowerCase() === 'integrated gpu' && 
      isIntegratedGraphics(normalizedProduct)) {
    return true;
  }
  
  // Special filter case: "Dedicated GPU"
  if (filterValue.toLowerCase() === 'dedicated gpu' && 
      !isIntegratedGraphics(normalizedProduct)) {
    return true;
  }
  
  // Secondary case: more detailed checking based on GPU type
  const productLower = normalizedProduct.toLowerCase();
  const filterLower = filterValue.toLowerCase();
  
  // Handle Intel graphics family matches
  if (filterLower.includes('intel') && productLower.includes('intel')) {
    return matchesIntelGraphics(filterLower, productLower);
  }
  
  // NVIDIA discrete GPU matching
  if ((filterLower.includes('rtx') || filterLower.includes('gtx') || filterLower.includes('nvidia')) &&
      (productLower.includes('rtx') || productLower.includes('gtx') || productLower.includes('nvidia'))) {
    return matchesNvidiaGraphics(filterLower, productLower);
  }
  
  // AMD graphics
  if ((filterLower.includes('radeon') || filterLower.includes('amd') || filterLower.includes('vega')) && 
      (productLower.includes('radeon') || productLower.includes('amd') || productLower.includes('vega'))) {
    return matchesAmdGraphics(filterLower, productLower);
  }
  
  // Apple integrated graphics
  if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3') || 
      filterLower.includes('apple')) &&
      (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3') || 
      productLower.includes('apple'))) {
    return matchesAppleGraphics(filterLower, productLower);
  }
  
  // Check for generic GPU terms
  if (filterLower === 'nvidia' && productLower.includes('nvidia')) {
    return true;
  }
  
  if (filterLower === 'amd' && productLower.includes('amd')) {
    return true;
  }
  
  if (filterLower === 'intel' && productLower.includes('intel')) {
    return true;
  }
  
  // Reject vague or meaningless graphics terms
  if (filterLower === 'graphics' || filterLower === 'gpu' || 
      filterLower === 'integrated' || filterLower === 'dedicated' || 
      filterLower === '32-core') {
    return false;
  }
  
  // Match by major GPU brand terms
  const gpuBrands = ['nvidia', 'amd', 'radeon', 'intel', 'apple', 'rtx', 'gtx'];
  const sharesBrand = gpuBrands.some(brand => 
    filterLower.includes(brand) && productLower.includes(brand)
  );
  
  // If it shares a brand term and all filter words are in the product
  const filterWords = filterLower.split(/\s+/);
  return sharesBrand && filterWords.every(word => productLower.includes(word));
};
