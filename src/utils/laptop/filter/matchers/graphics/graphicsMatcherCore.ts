
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

// New specialized matchers for additional GTX models
const isGtx1060 = (
  filterValue: string,
  productFilterValue: string,
  normalizedProduct: string
): boolean => {
  return filterValue === 'NVIDIA GTX 1060' && 
    (productFilterValue === 'NVIDIA GTX 1060' || 
     normalizedProduct.toLowerCase().includes('gtx 1060') ||
     normalizedProduct.toLowerCase().includes('gtx1060'));
};

const isGtx1070 = (
  filterValue: string,
  productFilterValue: string,
  normalizedProduct: string
): boolean => {
  return filterValue === 'NVIDIA GTX 1070' && 
    (productFilterValue === 'NVIDIA GTX 1070' || 
     normalizedProduct.toLowerCase().includes('gtx 1070') ||
     normalizedProduct.toLowerCase().includes('gtx1070'));
};

const isGtx1080 = (
  filterValue: string,
  productFilterValue: string,
  normalizedProduct: string
): boolean => {
  return filterValue === 'NVIDIA GTX 1080' && 
    (productFilterValue === 'NVIDIA GTX 1080' || 
     normalizedProduct.toLowerCase().includes('gtx 1080') ||
     normalizedProduct.toLowerCase().includes('gtx1080'));
};

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
  if (isGtx1060(filterValue, productFilterValue, normalizedProduct)) {
    return true;
  }
  
  if (isGtx1070(filterValue, productFilterValue, normalizedProduct)) {
    return true;
  }
  
  if (isGtx1080(filterValue, productFilterValue, normalizedProduct)) {
    return true;
  }
  
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
  
  // Additional check for GTX 10-series in both filter and product
  if (filterLower.includes('gtx 10') && productLower.includes('gtx 10')) {
    // Check for exact model match (e.g., GTX 1060 in both)
    if (filterLower.includes('1060') && productLower.includes('1060')) return true;
    if (filterLower.includes('1070') && productLower.includes('1070')) return true;
    if (filterLower.includes('1080') && productLower.includes('1080')) return true;
  }
  
  // Special handling for products with 'geforce' but no explicit nvidia mention
  if (filterLower.includes('nvidia') && !productLower.includes('nvidia') && productLower.includes('geforce')) {
    // If filter is for a specific NVIDIA GTX model
    if (filterLower.includes('gtx 1060') && productLower.includes('gtx 1060')) return true;
    if (filterLower.includes('gtx 1070') && productLower.includes('gtx 1070')) return true;
    if (filterLower.includes('gtx 1080') && productLower.includes('gtx 1080')) return true;
    if (filterLower.includes('gtx 1650') && productLower.includes('gtx 1650')) return true;
    if (filterLower.includes('gtx 1660') && productLower.includes('gtx 1660')) return true;
  }
  
  // Fall back to generic GPU matching
  return matchesGenericGPU(filterLower, productLower);
};
