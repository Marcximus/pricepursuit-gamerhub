
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
 * Check if a filter value matches a product value with stricter, category-specific matching rules
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
    case 'ram': {
      const productRamGB = parseRamValue(productValue);
      const filterRamGB = parseRamValue(filterValue);
      
      // Enforce realistic RAM values and stricter matching
      if (productRamGB < 2 || filterRamGB < 2) return false;
      
      // Exact match with minimal tolerance (0.1 GB)
      return Math.abs(productRamGB - filterRamGB) < 0.1;
    }
    
    case 'storage': {
      const productStorageGB = parseStorageValue(productValue);
      const filterStorageGB = parseStorageValue(filterValue);
      
      // Enforce realistic storage values and stricter matching
      if (productStorageGB < 128 || filterStorageGB < 128) return false;
      
      // More precise matching for storage sizes (within 0.5GB)
      return Math.abs(productStorageGB - filterStorageGB) < 0.5;
    }
    
    case 'screen_size': {
      const productSize = parseScreenSize(productValue);
      const filterSize = parseScreenSize(filterValue);
      
      // Enforce realistic screen sizes for laptops
      if (productSize < 10 || productSize > 22 || filterSize < 10 || filterSize > 22) {
        return false;
      }
      
      // More precise matching for screen sizes (within 0.05")
      return Math.abs(productSize - filterSize) < 0.05;
    }
    
    case 'processor': {
      // Apple processor matching
      if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3')) &&
          (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3'))) {
          
        // Match specific Apple CPU (M1, M2, M3)
        const filterHasM1 = filterLower.includes('m1');
        const filterHasM2 = filterLower.includes('m2');
        const filterHasM3 = filterLower.includes('m3');
        const productHasM1 = productLower.includes('m1');
        const productHasM2 = productLower.includes('m2');
        const productHasM3 = productLower.includes('m3');
        
        // Match the specific M-series chip
        if ((filterHasM1 && !productHasM1) || 
            (filterHasM2 && !productHasM2) || 
            (filterHasM3 && !productHasM3)) {
          return false;
        }
        
        // Match variants (Pro, Max, etc.)
        const filterHasPro = filterLower.includes('pro');
        const filterHasMax = filterLower.includes('max');
        const productHasPro = productLower.includes('pro');
        const productHasMax = productLower.includes('max');
        
        // If filter specifies Pro/Max variant, product must match
        if ((filterHasPro && !productHasPro) || 
            (filterHasMax && !productHasMax)) {
          return false;
        }
        
        return true;
      }
      
      // Intel Core i-series matching
      if ((filterLower.includes('i3') || filterLower.includes('i5') || 
           filterLower.includes('i7') || filterLower.includes('i9')) &&
          (productLower.includes('i3') || productLower.includes('i5') || 
           productLower.includes('i7') || productLower.includes('i9'))) {
        
        // Match the specific i-series number
        const filterMatch = filterLower.match(/i([3579])/);
        const productMatch = productLower.match(/i([3579])/);
        
        if (filterMatch && productMatch && filterMatch[1] === productMatch[1]) {
          // If the filter also specifies a generation, check that it matches
          const filterGen = filterLower.match(/(\d+)(st|nd|rd|th)?\s+gen/);
          const productGen = productLower.match(/(\d+)(st|nd|rd|th)?\s+gen/);
          
          if (filterGen && productGen) {
            return filterGen[1] === productGen[1];
          }
          
          // If filter has specific model number, check it
          const filterModel = filterLower.match(/i[3579][- ](\d{4,5})/);
          const productModel = productLower.match(/i[3579][- ](\d{4,5})/);
          
          if (filterModel && productModel) {
            // Match at least first 2 digits of model number (generation)
            return filterModel[1].substring(0, 2) === productModel[1].substring(0, 2);
          }
          
          return true;
        }
        return false;
      }
      
      // AMD Ryzen matching
      if (filterLower.includes('ryzen') && productLower.includes('ryzen')) {
        // Match the specific Ryzen series number
        const filterMatch = filterLower.match(/ryzen\s+([3579])/);
        const productMatch = productLower.match(/ryzen\s+([3579])/);
        
        if (filterMatch && productMatch) {
          return filterMatch[1] === productMatch[1];
        }
        
        // Match specific model numbers
        const filterModel = filterLower.match(/ryzen\s+\d\s+(\d{4})/);
        const productModel = productLower.match(/ryzen\s+\d\s+(\d{4})/);
        
        if (filterModel && productModel) {
          return filterModel[1].substring(0, 2) === productModel[1].substring(0, 2);
        }
      }
      
      // Check for basic CPU type matches
      const cpuTypes = ['intel', 'amd', 'ryzen', 'apple', 'celeron', 'pentium', 'xeon'];
      
      for (const type of cpuTypes) {
        if (filterLower.includes(type) && !productLower.includes(type)) {
          return false;
        }
      }
      
      // Check if generation numbers match when both have them
      const filterGenNum = filterLower.match(/\d{4}/);
      const productGenNum = productLower.match(/\d{4}/);
      
      if (filterGenNum && productGenNum) {
        // At least first two digits (generation) should match
        return filterGenNum[0].substring(0, 2) === productGenNum[0].substring(0, 2);
      }
      
      // More conservative approach - product should contain the filter value exactly
      const filterWords = filterLower.split(/\s+/);
      return filterWords.every(word => productLower.includes(word));
    }
    
    case 'graphics': {
      // NVIDIA discrete GPU matching
      if ((filterLower.includes('rtx') || filterLower.includes('gtx')) &&
          (productLower.includes('rtx') || productLower.includes('gtx'))) {
          
        const filterIsRTX = filterLower.includes('rtx');
        const productIsRTX = productLower.includes('rtx');
        
        // Must match the specific architecture (RTX vs GTX)
        if (filterIsRTX !== productIsRTX) {
          return false;
        }
        
        // Match the series number (e.g., RTX 30xx vs RTX 40xx)
        const filterSeries = filterLower.match(/(?:rtx|gtx)\s*(\d)/i);
        const productSeries = productLower.match(/(?:rtx|gtx)\s*(\d)/i);
        
        if (filterSeries && productSeries) {
          return filterSeries[1] === productSeries[1];
        }
        
        return true;
      }
      
      // Intel integrated graphics
      if (filterLower.includes('intel') && productLower.includes('intel')) {
        const graphicsTypes = ['iris xe', 'iris', 'uhd', 'hd'];
        for (const type of graphicsTypes) {
          if (filterLower.includes(type) !== productLower.includes(type)) {
            return false;
          }
        }
        return true;
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
      
      // Apple integrated graphics
      if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3')) &&
          (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3'))) {
        return (filterLower.includes('m1') && productLower.includes('m1')) ||
               (filterLower.includes('m2') && productLower.includes('m2')) ||
               (filterLower.includes('m3') && productLower.includes('m3'));
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
    }
    
    case 'brand': {
      // Use the specialized brand normalization function
      const normalizedProductBrand = normalizeBrand(productValue, productTitle);
      return normalizedProductBrand.toLowerCase() === filterValue.toLowerCase();
    }
    
    default:
      // Default case - exact string matching
      return productLower.includes(filterLower);
  }
};
