
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
  
  // Check for substring matches for certain processors
  // This helps match cases like "2.9 GHz Celeron" when "Intel Celeron" is selected
  if (productValue) {
    const normalizedProcessor = productValue.toLowerCase();
    
    if (filterValue === 'Intel Celeron' && normalizedProcessor.includes('celeron')) {
      return true;
    }
    
    if (filterValue === 'Intel Pentium' && normalizedProcessor.includes('pentium')) {
      return true;
    }
    
    if (filterValue === 'Qualcomm Snapdragon' && 
        (normalizedProcessor.includes('snapdragon') || normalizedProcessor.includes('qualcomm'))) {
      return true;
    }
    
    if (filterValue === 'MediaTek' && normalizedProcessor.includes('mediatek')) {
      return true;
    }
    
    // Match Apple M4 variants
    if (filterValue === 'Apple M4' && 
        (normalizedProcessor.includes('m4') || normalizedProcessor.includes('apple m4'))) {
      return true;
    }
    
    // Match specific Intel Core i-series regardless of generation prefix/suffix variations
    if (filterValue.includes('Intel Core i') && normalizedProcessor.includes('i' + filterValue.charAt(filterValue.length - 1))) {
      return true;
    }
    
    // Match GHz processor mentions with appropriate Intel Core category
    if (normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*i([3579])/i) ||
        normalizedProcessor.match(/i([3579]).*\d+(?:\.\d+)?\s*ghz/i)) {
      const coreNumber = normalizedProcessor.match(/i([3579])/i)?.[1];
      if (coreNumber && filterValue === `Intel Core i${coreNumber}`) {
        return true;
      }
    }
  }
  
  // Try to extract processor from title and standardize if available
  if (productTitle) {
    const normalizedProcessor = normalizeProcessor(productValue || '');
    const titleStandardizedProcessor = standardizeProcessorForFiltering(normalizedProcessor);
    
    if (titleStandardizedProcessor === filterValue) {
      return true;
    }
    
    // Also check the title for substring matches
    const normalizedTitle = productTitle.toLowerCase();
    
    if (filterValue === 'Intel Celeron' && normalizedTitle.includes('celeron')) {
      return true;
    }
    
    if (filterValue === 'Intel Pentium' && normalizedTitle.includes('pentium')) {
      return true;
    }
    
    if (filterValue === 'Qualcomm Snapdragon' && 
        (normalizedTitle.includes('snapdragon') || normalizedTitle.includes('qualcomm'))) {
      return true;
    }
    
    if (filterValue === 'MediaTek' && normalizedTitle.includes('mediatek')) {
      return true;
    }
    
    // Check for GHz mentions with core numbers in title
    if (normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*i([3579])/i) ||
        normalizedTitle.match(/i([3579]).*\d+(?:\.\d+)?\s*ghz/i)) {
      const coreNumber = normalizedTitle.match(/i([3579])/i)?.[1];
      if (coreNumber && filterValue === `Intel Core i${coreNumber}`) {
        return true;
      }
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
