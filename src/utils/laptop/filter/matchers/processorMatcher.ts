
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
    
    if (filterValue === 'Intel Celeron' && 
        (normalizedProcessor.includes('celeron') || 
         normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
         normalizedProcessor.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i))) {
      return true;
    }
    
    if (filterValue === 'Intel Pentium' && 
        (normalizedProcessor.includes('pentium') || 
         normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
         normalizedProcessor.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i))) {
      return true;
    }
    
    if (filterValue === 'Qualcomm Snapdragon' && 
        (normalizedProcessor.includes('snapdragon') || normalizedProcessor.includes('qualcomm'))) {
      return true;
    }
    
    if (filterValue === 'MediaTek' && normalizedProcessor.includes('mediatek')) {
      return true;
    }
    
    // Match Apple M-series (improved to catch more variations)
    if (filterValue.startsWith('Apple M') && filterValue.length >= 8) {
      const mVersion = filterValue.charAt(7); // Get the number (1-4)
      const regex = new RegExp(`\\bm${mVersion}\\b|\\bapple\\s*m${mVersion}\\b`, 'i');
      
      if (regex.test(normalizedProcessor)) {
        // For base M-series, make sure it's not a Pro/Max/Ultra variant
        if (filterValue.length === 8 && 
            !normalizedProcessor.includes('pro') && 
            !normalizedProcessor.includes('max') && 
            !normalizedProcessor.includes('ultra')) {
          return true;
        }
        // For variants (Pro/Max/Ultra)
        else if (filterValue.length > 8) {
          const variant = filterValue.substring(9).toLowerCase().trim();
          if (normalizedProcessor.includes(variant)) {
            return true;
          }
        }
      }
    }
    
    // Match Intel Core Ultra
    if (filterValue.startsWith('Intel Core Ultra') && 
        (normalizedProcessor.includes('core ultra') || 
         normalizedProcessor.includes('intel ultra') ||
         normalizedProcessor.match(/\d+-core\s+ultra/i))) {
      const ultraNumber = filterValue.split(' ').pop(); // Get the number (5,7,9)
      if (ultraNumber && 
          (normalizedProcessor.includes(`ultra ${ultraNumber}`) || 
           normalizedProcessor.includes(`ultra${ultraNumber}`) ||
           normalizedProcessor.match(new RegExp(`\\bultra\\s*${ultraNumber}\\b`, 'i')) ||
           normalizedProcessor.match(new RegExp(`\\bcore\\s*ultra\\s*${ultraNumber}\\b`, 'i')))) {
        return true;
      }
    }
    
    // Match specific Intel Core i-series (improved to catch more variations)
    if (filterValue.includes('Intel Core i') && filterValue.length === 12) { // Basic Intel Core i# format
      const coreNumber = filterValue.charAt(filterValue.length - 1);
      // Match patterns like i7, i7-xxxx, Core i7, Intel i7, core_i7
      const coreRegex = new RegExp(`\\bi${coreNumber}\\b|\\bcore\\s*i${coreNumber}\\b|\\bcore_i${coreNumber}\\b`, 'i');
      if (coreRegex.test(normalizedProcessor)) {
        return true;
      }
      
      // Match GHz Core i7 patterns
      if (normalizedProcessor.match(new RegExp(`\\d+(?:\\.\\d+)?\\s*ghz.*(?:core\\s*)?i${coreNumber}\\b`, 'i')) ||
          normalizedProcessor.match(new RegExp(`(?:core\\s*)?i${coreNumber}.*\\d+(?:\\.\\d+)?\\s*ghz`, 'i'))) {
        return true;
      }
    }
    
    // Match Intel Core with generation info (improved)
    if (filterValue.includes('Intel Core i') && filterValue.includes('Gen')) {
      const coreNumber = filterValue.match(/i([3579])/)?.[1];
      const genInfo = filterValue.includes('13th/14th') ? ['13th', '14th', '13', '14'] :
                      filterValue.includes('11th/12th') ? ['11th', '12th', '11', '12'] :
                      filterValue.includes('10th') ? ['10th', '10'] : [];
                      
      if (coreNumber && genInfo.some(gen => normalizedProcessor.includes(gen))) {
        return normalizedProcessor.includes(`i${coreNumber}`) || 
               normalizedProcessor.includes(`core i${coreNumber}`) ||
               normalizedProcessor.includes(`core_i${coreNumber}`);
      }
    }
    
    // Match AMD Ryzen (improved to catch ryzen_5_3500u style patterns)
    if (filterValue.startsWith('AMD Ryzen') && 
        (normalizedProcessor.includes('ryzen') || normalizedProcessor.includes('amd'))) {
      const ryzenNumber = filterValue.split(' ').pop(); // Get the number (3,5,7,9)
      // Match patterns like ryzen 5, ryzen5, ryzen_5, ryzen-5
      const ryzenRegex = new RegExp(`\\bryzen[_\\s-]*${ryzenNumber}\\b`, 'i');
      if (ryzenRegex.test(normalizedProcessor)) {
        return true;
      }
      
      // Match specific model numbers like 3500u
      if (normalizedProcessor.match(new RegExp(`\\bryzen[_\\s-]*${ryzenNumber}[_\\s-]\\d{4}[a-z]?\\b`, 'i'))) {
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
    
    // Match Apple M-series in title
    if (filterValue.startsWith('Apple M')) {
      const mVersion = filterValue.charAt(7); // Get the number (1-4)
      const regex = new RegExp(`\\bm${mVersion}\\b|\\bapple\\s*m${mVersion}\\b`, 'i');
      
      if (regex.test(normalizedTitle)) {
        // For base M-series, make sure it's not a Pro/Max/Ultra variant
        if (filterValue.length === 8 && 
            !normalizedTitle.includes('pro') && 
            !normalizedTitle.includes('max') && 
            !normalizedTitle.includes('ultra')) {
          return true;
        }
        // For variants (Pro/Max/Ultra)
        else if (filterValue.length > 8) {
          const variant = filterValue.substring(9).toLowerCase().trim();
          if (normalizedTitle.includes(variant)) {
            return true;
          }
        }
      }
    }
    
    // Specific Intel Core Ultra matching in title
    if (filterValue.startsWith('Intel Core Ultra') && 
        (normalizedTitle.includes('core ultra') || normalizedTitle.includes('-core ultra'))) {
      const ultraNumber = filterValue.split(' ').pop(); // Get the number (5,7,9)
      if (ultraNumber && 
          (normalizedTitle.includes(`ultra ${ultraNumber}`) || 
           normalizedTitle.includes(`core ultra ${ultraNumber}`))) {
        return true;
      }
    }
    
    // Intel Celeron specific model matching in title
    if (filterValue === 'Intel Celeron' && 
        (normalizedTitle.includes('celeron') || 
         normalizedTitle.match(/\bceleron\s+n\d{4}\b/i) ||
         normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
         normalizedTitle.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i))) {
      return true;
    }
    
    // Intel Pentium matching in title
    if (filterValue === 'Intel Pentium' && 
        (normalizedTitle.includes('pentium') ||
         normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
         normalizedTitle.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i))) {
      return true;
    }
    
    // Try to match model numbers in title
    if (filterValue.includes('Intel Core i')) {
      const coreNumber = filterValue.match(/i([3579])/)?.[1];
      // Match patterns like "Intel Core i5-1135G7" or just "i5" or "core_i5" in title
      if (coreNumber && 
          (normalizedTitle.match(new RegExp(`i${coreNumber}[- ]\\d{4,5}[a-z]*`, 'i')) || 
           normalizedTitle.match(new RegExp(`\\bi${coreNumber}\\b`, 'i')) ||
           normalizedTitle.match(new RegExp(`\\bcore_i${coreNumber}\\b`, 'i')))) {
        return true;
      }
    }
    
    // Match GHz mentions with core numbers in title
    if (normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*(?:core\s*)?i([3579])/i) ||
        normalizedTitle.match(/(?:core\s*)?i([3579]).*\d+(?:\.\d+)?\s*ghz/i) ||
        normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*core_i([3579])/i) ||
        normalizedTitle.match(/core_i([3579]).*\d+(?:\.\d+)?\s*ghz/i)) {
      const coreNumber = normalizedTitle.match(/i([3579])/i)?.[1] || 
                         normalizedTitle.match(/core_i([3579])/i)?.[1];
      if (coreNumber && filterValue === `Intel Core i${coreNumber}`) {
        return true;
      }
    }
    
    // Match AMD Ryzen in title (improved to catch ryzen_5_3500u style patterns)
    if (filterValue.startsWith('AMD Ryzen') && 
        (normalizedTitle.includes('ryzen') || normalizedTitle.includes('amd'))) {
      const ryzenNumber = filterValue.split(' ').pop(); // Get the number (3,5,7,9)
      
      // Match patterns like ryzen 5, ryzen5, ryzen_5, ryzen-5
      const ryzenRegex = new RegExp(`\\bryzen[_\\s-]*${ryzenNumber}\\b`, 'i');
      if (ryzenRegex.test(normalizedTitle)) {
        return true;
      }
      
      // Match specific model numbers like 3500u
      if (normalizedTitle.match(new RegExp(`\\bryzen[_\\s-]*${ryzenNumber}[_\\s-]\\d{4}[a-z]?\\b`, 'i'))) {
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
    
    // Check against BOTH product value and title
    let belongsToMainCategory = false;
    
    // Product value check with improved detections for "in-between" formats
    if (productValue) {
      const normalizedProcessor = productValue.toLowerCase();
      
      // Check if the processor includes any main category name
      belongsToMainCategory = mainProcessorCategories.some(category => 
        normalizedProcessor.includes(category.toLowerCase())
      );
      
      // Additional checks for formats that might slip through
      if (!belongsToMainCategory) {
        // Core i series without "Intel" prefix
        if (normalizedProcessor.match(/\b(?:core\s*)?i[3579](?:[-\s]\d{4,5}[a-z]*)?/i) ||
            normalizedProcessor.match(/\bcore_i[3579]\b/i)) {
          return false; // Should match Intel Core i series
        }
        
        // Celeron with model number or GHz
        if (normalizedProcessor.match(/\bceleron\s*n\d{4}/i) ||
            normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
            normalizedProcessor.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i)) {
          return false; // Should match Intel Celeron
        }
        
        // Pentium with model number or GHz
        if (normalizedProcessor.match(/\bpentium\s*\w+/i) ||
            normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
            normalizedProcessor.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i)) {
          return false; // Should match Intel Pentium
        }
        
        // AMD Ryzen without "AMD" prefix
        if (normalizedProcessor.match(/\bryzen[_\s-]*[3579](?:[_\s-]\d{4}[a-z]*)?\b/i)) {
          return false; // Should match AMD Ryzen
        }
        
        // M-series without "Apple" prefix
        if (normalizedProcessor.match(/\bm[1234](?:\s*(?:pro|max|ultra))?\b/i) &&
            !normalizedProcessor.includes('ram') && 
            !normalizedProcessor.includes('memory')) {
          return false; // Should match Apple M series
        }
        
        // Ultra without "Core" prefix
        if (normalizedProcessor.match(/\bultra\s*[579]\b/i) ||
            normalizedProcessor.match(/\b\d+-core\s+ultra\b/i)) {
          return false; // Should match Intel Core Ultra
        }
      }
    }
    
    // If not found in product value, check title with similar improved checks
    if (!belongsToMainCategory && productTitle) {
      const normalizedTitle = productTitle.toLowerCase();
      
      // Check main categories in title
      belongsToMainCategory = mainProcessorCategories.some(category => 
        normalizedTitle.includes(category.toLowerCase())
      );
      
      // If still not found, check for edge cases in title
      if (!belongsToMainCategory) {
        // Core i series without "Intel" prefix
        if (normalizedTitle.match(/\b(?:core\s*)?i[3579](?:[-\s]\d{4,5}[a-z]*)?/i) ||
            normalizedTitle.match(/\bcore_i[3579]\b/i)) {
          return false; // Should match Intel Core i series
        }
        
        // Celeron with model number or GHz
        if (normalizedTitle.match(/\bceleron\s*n\d{4}/i) ||
            normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
            normalizedTitle.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i)) {
          return false; // Should match Intel Celeron
        }
        
        // Pentium with model number or GHz
        if (normalizedTitle.match(/\bpentium\s*\w+/i) ||
            normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
            normalizedTitle.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i)) {
          return false; // Should match Intel Pentium
        }
        
        // AMD Ryzen without "AMD" prefix
        if (normalizedTitle.match(/\bryzen[_\s-]*[3579](?:[_\s-]\d{4}[a-z]*)?\b/i)) {
          return false; // Should match AMD Ryzen
        }
        
        // M-series without "Apple" prefix
        if (normalizedTitle.match(/\bm[1234](?:\s*(?:pro|max|ultra))?\b/i) &&
            !normalizedTitle.includes('ram') && 
            !normalizedTitle.includes('memory')) {
          return false; // Should match Apple M series
        }
        
        // Ultra without "Core" prefix
        if (normalizedTitle.match(/\bultra\s*[579]\b/i) ||
            normalizedTitle.match(/\b\d+-core\s+ultra\b/i)) {
          return false; // Should match Intel Core Ultra
        }
        
        // GHz with core_i patterns that should match Intel Core
        if (normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*core_i[3579]/i) ||
            normalizedTitle.match(/core_i[3579].*\d+(?:\.\d+)?\s*ghz/i)) {
          return false; // Should match Intel Core i series
        }
      }
    }
    
    // Only categorize as "Other Processor" if it doesn't match any main category
    return !belongsToMainCategory;
  }
  
  return false;
};

