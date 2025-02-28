
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
    if (filterValue.startsWith('Apple M') && filterValue.length === 8) {
      const mVersion = filterValue.charAt(7); // Get the number (1-4)
      if (normalizedProcessor.includes(`m${mVersion}`) || normalizedProcessor.includes(`apple m${mVersion}`)) {
        return true;
      }
    }
    
    // Match Apple M with variants (Pro/Max/Ultra)
    if (filterValue.startsWith('Apple M') && filterValue.includes(' ')) {
      const parts = filterValue.split(' ');
      if (parts.length >= 3) { // Apple M1 Pro format
        const mVersion = parts[1].charAt(1); // Get the number from M1, M2, etc.
        const variant = parts[2].toLowerCase(); // pro, max, ultra
        if (normalizedProcessor.includes(`m${mVersion} ${variant}`) || 
            normalizedProcessor.includes(`apple m${mVersion} ${variant}`)) {
          return true;
        }
      }
    }
    
    // Match Intel Core Ultra
    if (filterValue.startsWith('Intel Core Ultra') && normalizedProcessor.includes('core ultra')) {
      const ultraNumber = filterValue.split(' ').pop(); // Get the number (5,7,9)
      if (normalizedProcessor.includes(`ultra ${ultraNumber}`) || normalizedProcessor.includes(`ultra${ultraNumber}`)) {
        return true;
      }
    }
    
    // Match specific Intel Core i-series regardless of generation prefix/suffix variations
    if (filterValue.includes('Intel Core i') && filterValue.length === 12) { // Basic Intel Core i# format
      const coreNumber = filterValue.charAt(filterValue.length - 1);
      // Match patterns like i5, i5-1135G7, Core i5, Intel i5
      if (normalizedProcessor.includes(`i${coreNumber}`) || 
          normalizedProcessor.includes(`core i${coreNumber}`)) {
        return true;
      }
    }
    
    // Match Intel Core with generation info
    if (filterValue.includes('Intel Core i') && filterValue.includes('Gen')) {
      const coreNumber = filterValue.match(/i([3579])/)?.[1];
      const genInfo = filterValue.includes('13th/14th') ? ['13th', '14th', '13', '14'] :
                      filterValue.includes('11th/12th') ? ['11th', '12th', '11', '12'] :
                      filterValue.includes('10th') ? ['10th', '10'] : [];
                      
      if (coreNumber && genInfo.some(gen => normalizedProcessor.includes(gen))) {
        return normalizedProcessor.includes(`i${coreNumber}`);
      }
    }
    
    // Match AMD Ryzen
    if (filterValue.startsWith('AMD Ryzen') && normalizedProcessor.includes('ryzen')) {
      const ryzenNumber = filterValue.split(' ').pop(); // Get the number (3,5,7,9)
      if (normalizedProcessor.includes(`ryzen ${ryzenNumber}`) || 
          normalizedProcessor.includes(`ryzen${ryzenNumber}`)) {
        return true;
      }
    }
    
    // Match GHz processor mentions with appropriate Intel Core category
    if (normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*i([3579])/i) ||
        normalizedProcessor.match(/i([3579]).*\d+(?:\.\d+)?\s*ghz/i)) {
      const coreNumber = normalizedProcessor.match(/i([3579])/i)?.[1];
      if (coreNumber && filterValue === `Intel Core i${coreNumber}`) {
        return true;
      }
    }
    
    // Match model numbers for Intel processors
    if (filterValue.includes('Intel Core i') && normalizedProcessor.match(/i[3579]-\d{4,5}[a-z]*/i)) {
      const coreNumber = normalizedProcessor.match(/i([3579])/i)?.[1];
      if (coreNumber && filterValue.includes(`Core i${coreNumber}`)) {
        return true;
      }
    }
  }
  
  // Try to extract processor from title and standardize if available
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    // Try to match model numbers in title
    if (filterValue.includes('Intel Core i')) {
      const coreNumber = filterValue.match(/i([3579])/)?.[1];
      // Match patterns like "Intel Core i5-1135G7" or just "i5" in title
      if (coreNumber && (normalizedTitle.match(new RegExp(`i${coreNumber}[- ]\\d{4,5}[a-z]*`, 'i')) || 
                          normalizedTitle.match(new RegExp(`\\bi${coreNumber}\\b`, 'i')))) {
        return true;
      }
    }
    
    // Match GHz mentions with core numbers in title
    if (normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*i([3579])/i) ||
        normalizedTitle.match(/i([3579]).*\d+(?:\.\d+)?\s*ghz/i)) {
      const coreNumber = normalizedTitle.match(/i([3579])/i)?.[1];
      if (coreNumber && filterValue === `Intel Core i${coreNumber}`) {
        return true;
      }
    }
    
    // Check for Apple Silicon in title
    if (filterValue.startsWith('Apple M') && 
        (normalizedTitle.includes('m1') || normalizedTitle.includes('m2') || 
         normalizedTitle.includes('m3') || normalizedTitle.includes('m4'))) {
      const mVersion = filterValue.match(/Apple M(\d)/)?.[1];
      if (mVersion && normalizedTitle.includes(`m${mVersion}`)) {
        // Check for variants
        if (filterValue.includes('Pro') && normalizedTitle.includes('pro')) return true;
        if (filterValue.includes('Max') && normalizedTitle.includes('max')) return true;
        if (filterValue.includes('Ultra') && normalizedTitle.includes('ultra')) return true;
        if (!filterValue.includes('Pro') && !filterValue.includes('Max') && 
            !filterValue.includes('Ultra') && 
            !normalizedTitle.includes('pro') && !normalizedTitle.includes('max') && 
            !normalizedTitle.includes('ultra')) {
          return true;
        }
      }
    }
    
    // Check for standard processor references in title
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
    
    // Match AMD Ryzen in title
    if (filterValue.startsWith('AMD Ryzen') && normalizedTitle.includes('ryzen')) {
      const ryzenNumber = filterValue.split(' ').pop(); // Get the number (3,5,7,9)
      if (normalizedTitle.includes(`ryzen ${ryzenNumber}`) || 
          normalizedTitle.includes(`ryzen${ryzenNumber}`)) {
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
    
    // Product value check
    if (productValue) {
      // Check if the processor doesn't belong to any main category
      const belongsToMainCategory = mainProcessorCategories.some(category => 
        productValue.toLowerCase().includes(category.toLowerCase())
      );
      
      if (!belongsToMainCategory) {
        return true;
      }
    }
    
    // Title check if product value doesn't match any category
    if (productTitle) {
      // Check if the title doesn't contain any main processor category
      const titleContainsMainCategory = mainProcessorCategories.some(category => 
        productTitle.toLowerCase().includes(category.toLowerCase())
      );
      
      // If neither product value nor title contains a main category, it's "Other"
      if (!titleContainsMainCategory) {
        return true;
      }
    }
  }
  
  return false;
};
