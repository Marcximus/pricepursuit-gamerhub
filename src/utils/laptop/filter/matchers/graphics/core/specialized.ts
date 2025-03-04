
/**
 * Specialized graphics matcher utilities for special cases
 */

// Check for direct GTX 1650 match
export const isGtx1650 = (
  filterValue: string,
  productFilterValue: string,
  normalizedProduct: string
): boolean => {
  return filterValue === 'NVIDIA GTX 1650' && 
    (productFilterValue === 'NVIDIA GTX 1650' || 
     normalizedProduct.toLowerCase().includes('gtx 1650') ||
     normalizedProduct.toLowerCase().includes('gtx1650'));
};

// Check for direct GTX 1660 match
export const isGtx1660 = (
  filterValue: string,
  productFilterValue: string,
  normalizedProduct: string
): boolean => {
  return filterValue === 'NVIDIA GTX 1660' && 
    (productFilterValue === 'NVIDIA GTX 1660' || 
     normalizedProduct.toLowerCase().includes('gtx 1660') ||
     normalizedProduct.toLowerCase().includes('gtx1660'));
};

// Check for direct category match
export const isDirectCategoryMatch = (
  productFilterValue: string,
  filterValue: string
): boolean => {
  return productFilterValue.toLowerCase() === filterValue.toLowerCase();
};

// Check for "High Performance GPU" match
export const isHighPerformanceMatch = (
  filterValue: string,
  normalizedProduct: string,
  isHighPerformanceGraphics: (graphics: string) => boolean
): boolean => {
  return filterValue.toLowerCase() === 'high performance gpu' && 
    isHighPerformanceGraphics(normalizedProduct);
};

// Check for "Integrated GPU" match
export const isIntegratedMatch = (
  filterValue: string,
  normalizedProduct: string,
  isIntegratedGraphics: (graphics: string) => boolean
): boolean => {
  return filterValue.toLowerCase() === 'integrated gpu' && 
    isIntegratedGraphics(normalizedProduct);
};

// Check for "Dedicated GPU" match
export const isDedicatedMatch = (
  filterValue: string,
  normalizedProduct: string,
  isIntegratedGraphics: (graphics: string) => boolean
): boolean => {
  return filterValue.toLowerCase() === 'dedicated gpu' && 
    !isIntegratedGraphics(normalizedProduct);
};

// Check if a filter value is a vague or meaningless term
export const isVagueGraphicsTerm = (filterLower: string): boolean => {
  return filterLower === 'graphics' || 
         filterLower === 'gpu' || 
         filterLower === 'integrated' || 
         filterLower === 'dedicated' || 
         filterLower === '32-core';
};
