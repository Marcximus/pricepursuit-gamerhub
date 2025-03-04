
import { normalizeGraphics, getGraphicsFilterValue, isIntegratedGraphics, isHighPerformanceGraphics } from "@/utils/laptop/normalizers/graphicsNormalizer";
import { 
  matchesNvidiaGraphics,
  matchesAmdGraphics,
  matchesIntelGraphics,
  matchesAppleGraphics
} from './';

/**
 * Enhanced matcher for graphics card filter values with improved accuracy
 * and specific model detection capabilities
 */
export const matchesGraphicsFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
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
  
  // NVIDIA detailed GPU matching - now with improved model number detection
  if ((filterLower.includes('rtx') || filterLower.includes('gtx') || filterLower.includes('nvidia')) &&
      (productLower.includes('rtx') || productLower.includes('gtx') || productLower.includes('nvidia'))) {
    
    // Check for specific model numbers in both filter and product
    const filterModelMatch = filterLower.match(/(?:rtx|gtx)\s*(\d{4}|\d{3})/i);
    const productModelMatch = productLower.match(/(?:rtx|gtx)\s*(\d{4}|\d{3})/i);
    
    // If filter specifies a model number but product doesn't match it, reject
    if (filterModelMatch && productModelMatch) {
      // Match only when the model numbers match
      if (filterModelMatch[1] !== productModelMatch[1]) {
        return false;
      }
    }
    
    return matchesNvidiaGraphics(filterLower, productLower);
  }
  
  // AMD detailed GPU matching - improved for specific Radeon models
  if ((filterLower.includes('radeon') || filterLower.includes('amd')) && 
      (productLower.includes('radeon') || productLower.includes('amd'))) {
    
    // Check for specific AMD GPU series match
    const filterSeriesMatch = filterLower.match(/rx\s*(\d{3,4})/i);
    const productSeriesMatch = productLower.match(/rx\s*(\d{3,4})/i);
    
    // If filter specifies a series but product doesn't match it, reject
    if (filterSeriesMatch && productSeriesMatch) {
      if (filterSeriesMatch[1] !== productSeriesMatch[1]) {
        return false;
      }
    }
    
    // Handle specific Vega models
    if (filterLower.includes('vega') && productLower.includes('vega')) {
      const filterVegaMatch = filterLower.match(/vega\s*(\d+)/i);
      const productVegaMatch = productLower.match(/vega\s*(\d+)/i);
      
      if (filterVegaMatch && productVegaMatch) {
        return filterVegaMatch[1] === productVegaMatch[1];
      }
    }
    
    return matchesAmdGraphics(filterLower, productLower);
  }
  
  // Intel graphics
  if (filterLower.includes('intel') && productLower.includes('intel')) {
    return matchesIntelGraphics(filterLower, productLower);
  }
  
  // Apple integrated graphics
  if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3') || 
      filterLower.includes('apple')) &&
      (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3') || 
      productLower.includes('apple'))) {
    return matchesAppleGraphics(filterLower, productLower);
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
  
  // Enhanced word matching to require all words in filter to be in product value
  // This helps with matching specific models
  const filterWords = filterLower.split(/\s+/);
  const productWords = productLower.split(/\s+/);
  
  // If filter is just a brand name without a model, consider it a partial match
  if (filterWords.length === 1 && gpuBrands.includes(filterWords[0])) {
    return sharesBrand;
  }
  
  // If filter includes a model number, ensure it's matched
  const hasModelNumberInFilter = /\d{3,4}/.test(filterLower);
  if (hasModelNumberInFilter) {
    const filterModelNumbers = filterLower.match(/\d{3,4}/g) || [];
    const productModelNumbers = productLower.match(/\d{3,4}/g) || [];
    
    // At least one model number in filter must be in product
    const sharesModelNumber = filterModelNumbers.some(model => 
      productModelNumbers.includes(model)
    );
    
    return sharesBrand && sharesModelNumber;
  }
  
  // For other cases, all filter words must be in product
  return sharesBrand && filterWords.every(word => productLower.includes(word));
};
