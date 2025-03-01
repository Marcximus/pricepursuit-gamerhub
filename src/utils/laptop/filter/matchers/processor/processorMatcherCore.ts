
import { 
  matchesAppleProcessor, 
  matchesIntelProcessor,
  matchesAmdProcessor,
  matchesOtherProcessor
} from './';
import { standardizeProcessorForFiltering } from "../../extractors/processor/processorStandardizer";

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

/**
 * Checks if a processor belongs to any of the main processor categories
 * Used by the "Other Processor" matcher
 */
export const isMainCategoryProcessor = (
  processorValue: string | null | undefined, 
  title?: string
): boolean => {
  if (!processorValue && !title) return false;
  
  // First prioritize checking the title
  if (title) {
    const normalizedTitle = title.toLowerCase();
    
    // Direct check for M-series chip pattern in title (highest priority for Apple Silicon)
    if (normalizedTitle.match(/\bm[1234]\s+chip\b/i)) {
      return true;
    }
    
    // Check Apple context with M-series in title
    if ((normalizedTitle.includes('apple') || normalizedTitle.includes('macbook')) && 
        normalizedTitle.match(/\bm[1234]\b/i) &&
        !normalizedTitle.includes('ram') && 
        !normalizedTitle.includes('memory')) {
      return true;
    }
    
    // Improved Apple M-series patterns detection in title
    if (normalizedTitle.match(/\bm[1234](?:\s*(?:pro|max|ultra))?\b/i) &&
        !normalizedTitle.includes('ram') && 
        !normalizedTitle.includes('memory') &&
        !normalizedTitle.includes('ssd')) {
      return true;
    }
    
    // Check for explicit Apple Silicon mentions in title
    if (normalizedTitle.includes('apple silicon') || 
        (normalizedTitle.includes('apple') && normalizedTitle.includes('chip'))) {
      return true;
    }
    
    // Check for Intel Core i-series with generation info
    if (normalizedTitle.match(/\d+th\s+gen|\d+th\s+generation/i) && 
        normalizedTitle.match(/i[3579]/i)) {
      return true;
    }
    
    // Check for Intel Core i-series with model numbers
    if (normalizedTitle.match(/i[3579][\s-]\d{4,5}/i)) {
      return true;
    }
    
    // Direct inclusion check in title for main categories
    const mainProcessorCategories = [
      'apple m', 'intel core i', 'intel core ultra', 'amd ryzen', 
      'intel celeron', 'intel pentium', 'qualcomm snapdragon', 'mediatek'
    ];
    
    if (mainProcessorCategories.some(category => 
      normalizedTitle.includes(category.toLowerCase())
    )) {
      return true;
    }
    
    // Check for Intel Core i-series patterns in title
    if (normalizedTitle.match(/\b(?:core\s*)?i[3579](?:[-\s]\d{4,5}[a-z]*)?/i) ||
        normalizedTitle.match(/\bcore_i[3579]\b/i)) {
      return true;
    }
    
    // Check for Celeron patterns in title
    if (normalizedTitle.match(/\bceleron\s*n\d{4}/i) ||
        normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
        normalizedTitle.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i)) {
      return true;
    }
    
    // Check for Pentium patterns in title
    if (normalizedTitle.match(/\bpentium\s*\w+/i) ||
        normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
        normalizedTitle.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i)) {
      return true;
    }
    
    // Check for AMD Ryzen patterns in title
    if (normalizedTitle.match(/\bryzen[_\s-]*[3579](?:[_\s-]\d{4}[a-z]*)?\b/i)) {
      return true;
    }
    
    // Check for Intel Core Ultra patterns in title
    if (normalizedTitle.match(/\bultra\s*[579]\b/i) ||
        normalizedTitle.match(/\b\d+-core\s+ultra\b/i)) {
      return true;
    }
    
    // Check for GHz with core_i patterns in title
    if (normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*core_i[3579]/i) ||
        normalizedTitle.match(/core_i[3579].*\d+(?:\.\d+)?\s*ghz/i)) {
      return true;
    }
  }
  
  // Fall back to checking the processor value
  if (processorValue) {
    const normalizedProcessor = processorValue.toLowerCase();
    
    // Check for Intel Core i-series with generation info
    if (normalizedProcessor.match(/\d+th\s+gen|\d+th\s+generation/i) && 
        normalizedProcessor.match(/i[3579]/i)) {
      return true;
    }
    
    // Check for Intel Core i-series with model numbers
    if (normalizedProcessor.match(/i[3579][\s-]\d{4,5}/i)) {
      return true;
    }
    
    // Direct inclusion check
    const mainProcessorCategories = [
      'Apple M', 'Intel Core i', 'Intel Core Ultra', 'AMD Ryzen', 
      'Intel Celeron', 'Intel Pentium', 'Qualcomm Snapdragon', 'MediaTek'
    ];
    
    if (mainProcessorCategories.some(category => 
      normalizedProcessor.includes(category.toLowerCase())
    )) {
      return true;
    }
    
    // Improved Apple M-series patterns detection
    if (normalizedProcessor.match(/\bm[1234](?:\s*(?:pro|max|ultra))?\b/i) &&
        !normalizedProcessor.includes('ram') && 
        !normalizedProcessor.includes('memory') &&
        !normalizedProcessor.includes('ssd')) {
      return true;
    }
    
    // Special case for standalone "m1", "m2", etc. references when not about RAM
    if ((normalizedProcessor.match(/\bm[1234]\b/i) || 
         normalizedProcessor.match(/\bm[1234]\s+chip\b/i) ||
         normalizedProcessor.match(/chip.*m[1234]/i)) &&
        !normalizedProcessor.includes('ram') && 
        !normalizedProcessor.includes('memory') &&
        !normalizedProcessor.includes('ssd')) {
      return true;
    }
    
    // Check for Intel Core i-series patterns without "Intel" prefix
    if (normalizedProcessor.match(/\b(?:core\s*)?i[3579](?:[-\s]\d{4,5}[a-z]*)?/i) ||
        normalizedProcessor.match(/\bcore_i[3579]\b/i)) {
      return true;
    }
    
    // Check for Celeron patterns
    if (normalizedProcessor.match(/\bceleron\s*n\d{4}/i) ||
        normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
        normalizedProcessor.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i)) {
      return true;
    }
    
    // Check for Pentium patterns
    if (normalizedProcessor.match(/\bpentium\s*\w+/i) ||
        normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
        normalizedProcessor.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i)) {
      return true;
    }
    
    // Check for AMD Ryzen patterns without "AMD" prefix
    if (normalizedProcessor.match(/\bryzen[_\s-]*[3579](?:[_\s-]\d{4}[a-z]*)?\b/i)) {
      return true;
    }
    
    // Check for Apple M-series patterns without "Apple" prefix
    if (normalizedProcessor.match(/\bm[1234](?:\s*(?:pro|max|ultra))?\b/i) &&
        !normalizedProcessor.includes('ram') && 
        !normalizedProcessor.includes('memory')) {
      return true;
    }
    
    // Check for Intel Core Ultra patterns without full prefix
    if (normalizedProcessor.match(/\bultra\s*[579]\b/i) ||
        normalizedProcessor.match(/\b\d+-core\s+ultra\b/i)) {
      return true;
    }
  }
  
  return false;
};
