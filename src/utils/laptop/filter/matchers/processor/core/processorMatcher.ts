
import { standardizeProcessorForFiltering } from "../../../extractors/processor/processorStandardizer";
import { matchesAppleProcessor } from '../appleProcessor';
import { matchesIntelProcessor } from '../intel/intelCore';
import { matchesAmdProcessor } from '../amdProcessor';
import { matchesOtherProcessor } from '../otherProcessor';

/**
 * Matcher for processor filter values with improved standardization
 */
export const matchesProcessorFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue && !productTitle) return false;
  
  // Get standardized category for the product's processor
  const standardizedProductProcessor = standardizeProcessorForFiltering(productValue);
  
  // Direct category match (preferred approach)
  if (standardizedProductProcessor === filterValue) {
    return true;
  }
  
  // Apple processor matching (M-series)
  if (filterValue.startsWith('Apple M')) {
    return matchesAppleProcessor(filterValue, productValue, productTitle);
  }
  
  // Intel processor matching (Core i-series, Core Ultra, Celeron, Pentium)
  if (filterValue.includes('Intel')) {
    return matchesIntelProcessor(filterValue, productValue, productTitle);
  }
  
  // AMD processor matching (Ryzen series)
  if (filterValue.startsWith('AMD Ryzen')) {
    return matchesAmdProcessor(filterValue, productValue, productTitle);
  }
  
  // Handle special case for "Other Processor" category
  if (filterValue === 'Other Processor') {
    return matchesOtherProcessor(productValue, productTitle);
  }
  
  return false;
};
