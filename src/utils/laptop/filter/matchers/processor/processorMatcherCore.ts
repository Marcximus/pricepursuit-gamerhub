
import { 
  matchesAppleProcessor, 
  matchesIntelProcessor,
  matchesAmdProcessor,
  matchesOtherProcessor,
  isMainCategoryProcessor
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
  
  const mainProcessorCategories = [
    'Apple M', 'Intel Core i', 'Intel Core Ultra', 'AMD Ryzen', 
    'Intel Celeron', 'Intel Pentium', 'Qualcomm Snapdragon', 'MediaTek'
  ];
  
  // Check against processor value
  if (processorValue) {
    const normalizedProcessor = processorValue.toLowerCase();
    
    // Direct inclusion check
    if (mainProcessorCategories.some(category => 
      normalizedProcessor.includes(category.toLowerCase())
    )) {
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
  
  // If not found in processor value, check title with similar patterns
  if (title) {
    const normalizedTitle = title.toLowerCase();
    
    // Direct inclusion check in title
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
    
    // Check for Apple M-series patterns in title
    if (normalizedTitle.match(/\bm[1234](?:\s*(?:pro|max|ultra))?\b/i) &&
        !normalizedTitle.includes('ram') && 
        !normalizedTitle.includes('memory')) {
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
  
  return false;
};
