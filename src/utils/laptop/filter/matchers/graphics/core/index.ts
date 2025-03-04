
// Export all core utilities
export * from './basic';
export * from './specialized';

// Export these additional matchers for GTX 10-series
export const isGtx1060 = (
  filterValue: string,
  productFilterValue: string, 
  normalizedProduct: string
): boolean => {
  return filterValue === 'NVIDIA GTX 1060' && 
    (productFilterValue === 'NVIDIA GTX 1060' || 
     normalizedProduct.toLowerCase().includes('gtx 1060') ||
     normalizedProduct.toLowerCase().includes('gtx1060'));
};

export const isGtx1070 = (
  filterValue: string,
  productFilterValue: string,
  normalizedProduct: string
): boolean => {
  return filterValue === 'NVIDIA GTX 1070' && 
    (productFilterValue === 'NVIDIA GTX 1070' || 
     normalizedProduct.toLowerCase().includes('gtx 1070') ||
     normalizedProduct.toLowerCase().includes('gtx1070'));
};

export const isGtx1080 = (
  filterValue: string,
  productFilterValue: string,
  normalizedProduct: string
): boolean => {
  return filterValue === 'NVIDIA GTX 1080' && 
    (productFilterValue === 'NVIDIA GTX 1080' || 
     normalizedProduct.toLowerCase().includes('gtx 1080') ||
     normalizedProduct.toLowerCase().includes('gtx1080'));
};
