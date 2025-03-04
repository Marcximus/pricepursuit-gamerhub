
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
  
  // NVIDIA discrete GPU matching
  if ((filterLower.includes('rtx') || filterLower.includes('gtx') || filterLower.includes('nvidia')) &&
      (productLower.includes('rtx') || productLower.includes('gtx') || productLower.includes('nvidia'))) {
    return matchesNvidiaGraphics(filterLower, productLower);
  }
  
  // Intel graphics
  if (filterLower.includes('intel') && productLower.includes('intel')) {
    return matchesIntelGraphics(filterLower, productLower);
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
