
/**
 * Common utility to parse value with unit from a string
 */
export const parseValueWithUnit = (
  value: string | null | undefined, 
  defaultUnit = 'GB'
): { value: number; unit: string } | null => {
  if (!value) return null;
  const match = value.match(/(\d+(\.\d+)?)\s*(GB|TB|MB|gb|tb|mb)/i);
  if (!match) return null;
  
  const [, amount, , unit] = match;
  return {
    value: parseFloat(amount),
    unit: unit?.toLowerCase() || defaultUnit.toLowerCase()
  };
};

/**
 * Check if a filter value matches a product value with category-specific matching rules
 */
export const matchesFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  filterType: 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand',
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Normalize values for comparison
  const productLower = productValue.toLowerCase().trim();
  const filterLower = filterValue.toLowerCase().trim();
  
  // If the strings are exactly equal after normalization, it's a match
  if (productLower === filterLower) {
    return true;
  }
  
  switch (filterType) {
    case 'ram':
      const { matchesRamFilter } = require('./ramMatcher');
      return matchesRamFilter(filterValue, productValue);
    
    case 'storage':
      const { matchesStorageFilter } = require('./storageMatcher');
      return matchesStorageFilter(filterValue, productValue);
    
    case 'screen_size':
      const { matchesScreenSizeFilter } = require('./screenSizeMatcher');
      return matchesScreenSizeFilter(filterValue, productValue);
    
    case 'processor':
      const { matchesProcessorFilter } = require('./processorMatcher');
      return matchesProcessorFilter(filterValue, productValue, productTitle);
    
    case 'graphics':
      const { matchesGraphicsFilter } = require('./graphicsMatcher');
      return matchesGraphicsFilter(filterValue, productValue, productTitle);
    
    case 'brand':
      const { matchesBrandFilter } = require('./brandMatcher');
      return matchesBrandFilter(filterValue, productValue, productTitle);
    
    default:
      // Fallback for any other filter types
      return productValue.toLowerCase().includes(filterValue.toLowerCase());
  }
};
