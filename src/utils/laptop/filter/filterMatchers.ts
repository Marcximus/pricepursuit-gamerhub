
import { normalizeBrand } from "@/utils/laptop/valueNormalizer";

/**
 * Parses RAM value from string to number in GB
 */
export const parseRamValue = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = value.match(/(\d+(\.\d+)?)\s*(GB|TB|MB|gb|tb|mb)/i);
  if (!match) return 0;
  
  const [, amount, , unit] = match;
  const numValue = parseFloat(amount);
  
  switch (unit.toLowerCase()) {
    case 'tb': return numValue * 1024;
    case 'mb': return numValue / 1024;
    case 'gb': return numValue;
    default: return 0;
  }
};

/**
 * Parses storage value from string to number in GB
 */
export const parseStorageValue = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = value.match(/(\d+(\.\d+)?)\s*(GB|TB|MB|gb|tb|mb)/i);
  if (!match) return 0;
  
  const [, amount, , unit] = match;
  const numValue = parseFloat(amount);
  
  switch (unit.toLowerCase()) {
    case 'tb': return numValue * 1024;
    case 'mb': return numValue / 1024;
    case 'gb': return numValue;
    default: return 0;
  }
};

/**
 * Parses screen size value from string to number in inches
 */
export const parseScreenSize = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = value.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

/**
 * Check if a filter value matches a product value with fuzzy matching for various formats
 */
export const matchesFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  filterType: 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand',
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  const productLower = productValue.toLowerCase();
  const filterLower = filterValue.toLowerCase();
  
  switch (filterType) {
    case 'ram': {
      const productRamGB = parseRamValue(productValue);
      const filterRamGB = parseRamValue(filterValue);
      return Math.abs(productRamGB - filterRamGB) < 0.5;
    }
    
    case 'storage': {
      const productStorageGB = parseStorageValue(productValue);
      const filterStorageGB = parseStorageValue(filterValue);
      return Math.abs(productStorageGB - filterStorageGB) < 0.5;
    }
    
    case 'screen_size': {
      const productSize = parseScreenSize(productValue);
      const filterSize = parseScreenSize(filterValue);
      return Math.abs(productSize - filterSize) < 0.1;
    }
    
    case 'processor': {
      // Match processor by key components
      if ((filterLower.includes('i3') || filterLower.includes('i5') || 
           filterLower.includes('i7') || filterLower.includes('i9')) &&
          (productLower.includes('i3') || productLower.includes('i5') || 
           productLower.includes('i7') || productLower.includes('i9'))) {
        
        const filterMatch = filterLower.match(/i([3579])/);
        const productMatch = productLower.match(/i([3579])/);
        
        if (filterMatch && productMatch && filterMatch[1] === productMatch[1]) {
          const filterGen = filterLower.match(/(\d+)(st|nd|rd|th)?\s+gen/);
          const productGen = productLower.match(/(\d+)(st|nd|rd|th)?\s+gen/);
          
          if (filterGen && productGen) {
            return filterGen[1] === productGen[1];
          }
          return true;
        }
        return false;
      }
      
      // Apple M-series pattern
      if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3')) &&
          (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3'))) {
        return (filterLower.includes('m1') && productLower.includes('m1')) ||
               (filterLower.includes('m2') && productLower.includes('m2')) ||
               (filterLower.includes('m3') && productLower.includes('m3'));
      }
      
      // AMD Ryzen pattern
      if (filterLower.includes('ryzen') && productLower.includes('ryzen')) {
        const filterMatch = filterLower.match(/ryzen\s+([3579])/);
        const productMatch = productLower.match(/ryzen\s+([3579])/);
        
        if (filterMatch && productMatch) {
          return filterMatch[1] === productMatch[1];
        }
      }
      
      return productLower.includes(filterLower);
    }
    
    case 'graphics': {
      // NVIDIA GPUs
      if ((filterLower.includes('rtx') || filterLower.includes('gtx')) &&
          (productLower.includes('rtx') || productLower.includes('gtx'))) {
          
        const filterIsRTX = filterLower.includes('rtx');
        const productIsRTX = productLower.includes('rtx');
        
        if (filterIsRTX !== productIsRTX) {
          return false;
        }
        
        const filterSeries = filterLower.match(/(?:rtx|gtx)\s*(\d)/i);
        const productSeries = productLower.match(/(?:rtx|gtx)\s*(\d)/i);
        
        if (filterSeries && productSeries) {
          return filterSeries[1] === productSeries[1];
        }
      }
      
      // Intel graphics
      if (filterLower.includes('intel') && productLower.includes('intel')) {
        const types = ['iris', 'uhd', 'hd'];
        return types.some(type => 
          filterLower.includes(type) === productLower.includes(type)
        );
      }
      
      // AMD graphics
      if (filterLower.includes('radeon') && productLower.includes('radeon')) {
        const filterHasRX = filterLower.includes('rx');
        const productHasRX = productLower.includes('rx');
        
        if (filterHasRX && productHasRX) {
          const filterSeries = filterLower.match(/rx\s*(\d)/i);
          const productSeries = productLower.match(/rx\s*(\d)/i);
          
          if (filterSeries && productSeries) {
            return filterSeries[1] === productSeries[1];
          }
          return true;
        }
        return !filterHasRX && !productHasRX;
      }
      
      // Apple GPUs
      if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3')) &&
          (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3'))) {
        return (filterLower.includes('m1') && productLower.includes('m1')) ||
               (filterLower.includes('m2') && productLower.includes('m2')) ||
               (filterLower.includes('m3') && productLower.includes('m3'));
      }
      
      return productLower.includes(filterLower);
    }
    
    case 'brand': {
      // Use the improved brand detection logic
      const normalizedProductBrand = normalizeBrand(productValue, productTitle);
      return normalizedProductBrand.toLowerCase() === filterValue.toLowerCase();
    }
    
    default:
      return productLower.includes(filterLower);
  }
};
