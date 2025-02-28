
import { normalizeProcessor, getProcessorFilterValue } from "@/utils/laptop/normalizers/processorNormalizer";

/**
 * Matcher for processor filter values with improved accuracy
 */
export const matchesProcessorFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Normalize both filter and product values for consistency
  const normalizedProduct = normalizeProcessor(productValue);
  
  // Get category-based filter values for better matching
  const productFilterValue = getProcessorFilterValue(normalizedProduct);
  
  // Primary case: direct category match
  if (productFilterValue.toLowerCase() === filterValue.toLowerCase()) {
    return true;
  }
  
  // Secondary case: more detailed checking
  const productLower = normalizedProduct.toLowerCase();
  const filterLower = filterValue.toLowerCase();
  
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
    const filterHasUltra = filterLower.includes('ultra');
    const productHasPro = productLower.includes('pro');
    const productHasMax = productLower.includes('max');
    const productHasUltra = productLower.includes('ultra');
    
    // If filter specifies variant, product must match
    if ((filterHasPro && !productHasPro) || 
        (filterHasMax && !productHasMax) || 
        (filterHasUltra && !productHasUltra)) {
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
  const cpuTypes = ['intel', 'amd', 'ryzen', 'apple', 'celeron', 'pentium', 'xeon', 'ultra'];
  
  let matchesType = false;
  for (const type of cpuTypes) {
    if (filterLower.includes(type)) {
      matchesType = productLower.includes(type);
      if (!matchesType) return false;
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
};
