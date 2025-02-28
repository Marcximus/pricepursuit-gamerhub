
import { standardizeProcessorForFiltering } from "../extractors/processorExtractor";
import { normalizeProcessor } from "@/utils/laptop/normalizers/processorNormalizer";

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
  
  // Try to extract processor from title and standardize if available
  if (productTitle) {
    const normalizedProcessor = normalizeProcessor(productValue || '');
    const titleStandardizedProcessor = standardizeProcessorForFiltering(normalizedProcessor);
    
    if (titleStandardizedProcessor === filterValue) {
      return true;
    }
  }
  
  // Handle special case for "Other Processor" category
  if (filterValue === 'Other Processor') {
    const mainProcessorCategories = [
      'Apple M', 'Intel Core i', 'Intel Core Ultra', 'AMD Ryzen', 
      'Intel Celeron', 'Intel Pentium', 'Qualcomm Snapdragon', 'MediaTek'
    ];
    
    // Check if the processor doesn't belong to any main category
    const belongsToMainCategory = mainProcessorCategories.some(category => 
      (productValue || '').toLowerCase().includes(category.toLowerCase())
    );
    
    return !belongsToMainCategory;
  }
  
  return false;
};
