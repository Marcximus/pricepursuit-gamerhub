
import { normalizeGraphics, getGraphicsFilterValue, isIntegratedGraphics, isHighPerformanceGraphics } from "@/utils/laptop/normalizers/graphics";

// Import all specific matcher functions
import { 
  matchesNvidiaGraphics, 
  matchesAmdGraphics, 
  matchesIntelGraphics, 
  matchesAppleGraphics,
  matchesGenericGPU,
  matchesOtherGraphics
} from './matcher';

// Import core utilities
import {
  isGtx1650,
  isGtx1660,
  isDirectCategoryMatch,
  isHighPerformanceMatch,
  isIntegratedMatch,
  isDedicatedMatch,
  isVagueGraphicsTerm
} from './core';

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
    
    return matchesOtherGraphics(normalizedProduct);
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
  
  // Special cases for specific GPU models
  if (isGtx1650(filterValue, productFilterValue, normalizedProduct)) {
    return true;
  }
  
  if (isGtx1660(filterValue, productFilterValue, normalizedProduct)) {
    return true;
  }
  
  // Primary case: direct category match
  if (isDirectCategoryMatch(productFilterValue, filterValue)) {
    return true;
  }
  
  // Special filter case: "High Performance GPU"
  if (isHighPerformanceMatch(filterValue, normalizedProduct, isHighPerformanceGraphics)) {
    return true;
  }
  
  // Special filter case: "Integrated GPU"
  if (isIntegratedMatch(filterValue, normalizedProduct, isIntegratedGraphics)) {
    return true;
  }
  
  // Special filter case: "Dedicated GPU"
  if (isDedicatedMatch(filterValue, normalizedProduct, isIntegratedGraphics)) {
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
  
  // Reject vague or meaningless graphics terms
  if (isVagueGraphicsTerm(filterLower)) {
    return false;
  }
  
  // Fall back to generic GPU matching
  return matchesGenericGPU(filterLower, productLower);
};
