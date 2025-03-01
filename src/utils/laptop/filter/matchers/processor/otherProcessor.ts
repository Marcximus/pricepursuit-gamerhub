
import { isMainCategoryProcessor } from './core/isMainCategoryProcessor';

/**
 * "Other Processor" category matcher
 * Only matches processors that don't belong to any main category
 */
export const matchesOtherProcessor = (
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  // If there's no processor info at all, don't categorize as "Other Processor"
  if (!productValue && !productTitle) {
    return false;
  }
  
  // First, prioritize checking the title for clear processor information
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    // Comprehensive Apple Silicon pattern detection in titles
    const appleTitlePatterns = [
      /\bm[1234]\s+chip\b/i,                // "M2 Chip"
      /\bmacbook.*m[1234]/i,                // "MacBook... M2"
      /\bapple.*m[1234]/i,                  // "Apple... M2"
      // Replace the problematic compound expression with a function that checks the same conditions
      (title: string) => {
        return /\bm[1234](?:\s+(?:pro|max|ultra))?\b/i.test(title) && 
               (title.includes('apple') || 
               title.includes('macbook') ||
               title.includes('chip'));
      }
    ];
    
    // If any Apple pattern is found in the title, this is not "Other Processor"
    for (const pattern of appleTitlePatterns) {
      if (typeof pattern === 'function') {
        if (pattern(normalizedTitle)) {
          return false;
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(normalizedTitle)) {
          return false;
        }
      }
    }
    
    // Intel Core i-series pattern detection in titles
    const intelTitlePatterns = [
      /\d+th\s+gen.*i[3579]/i,              // "10th Gen... i7"
      /i[3579].*\d+th\s+gen/i,              // "i7... 10th Gen"
      /\d+th\s+generation.*i[3579]/i,       // "10th Generation... i7"
      /i[3579].*\d+th\s+generation/i,       // "i7... 10th Generation"
      /i[3579][\s-]\d{4,5}[a-z]*/i,         // "i7-1065G7"
      /\bcore\s*i[3579]/i,                  // "Core i7"
      /\bcore_i[3579]/i,                    // "core_i7"
      /\bi[3579]\b/i,                       // standalone "i7"
    ];
    
    // If any Intel pattern is found in the title, this is not "Other Processor"
    for (const pattern of intelTitlePatterns) {
      if (pattern.test(normalizedTitle)) {
        return false;
      }
    }
    
    // Special case: If the title contains "MacBook" and processor is just "Apple", 
    // this is likely an Apple Silicon chip, not "Other Processor"
    if (normalizedTitle.includes('macbook') && productValue === 'Apple') {
      return false;
    }
  }
  
  // Check for explicit processor patterns in the provided processor value
  if (productValue) {
    const normalizedValue = productValue.toLowerCase();
    
    // Explicitly check for known processor patterns that should never be in "Other"
    const applePatterns = [
      /\bm[1234]\b/, /\bm[1234]\s+chip\b/, /\bapple\s+m[1234]\b/, /\bm[1234]\s+(pro|max|ultra)\b/,
      /\bm[1234][^\w]/, /\b[^\w]m[1234]\b/, /\bmacbook.*m[1234]\b/, /\bm[1234].*chip\b/, /\bchip.*m[1234]\b/
    ];
    
    for (const pattern of applePatterns) {
      if (pattern.test(normalizedValue)) {
        return false;
      }
    }
    
    // Intel patterns
    const intelPatterns = [
      /\d+th\s+gen.*i[3579]/i,              // "10th Gen... i7"
      /i[3579].*\d+th\s+gen/i,              // "i7... 10th Gen"
      /\d+th\s+generation.*i[3579]/i,       // "10th Generation... i7"
      /i[3579].*\d+th\s+generation/i,       // "i7... 10th Generation"
      /i[3579][\s-]\d{4,5}[a-z]*/i,         // "i7-1065G7"
      /\bcore\s*i[3579]/i,                  // "Core i7"
      /\bcore_i[3579]/i,                    // "core_i7"
      /\bi[3579]\b/i,                       // standalone "i7"
    ];
    
    for (const pattern of intelPatterns) {
      if (pattern.test(normalizedValue)) {
        return false;
      }
    }
    
    // Special case: If processor is just "Apple" and title contains MacBook, 
    // it's likely an Apple Silicon processor
    if (normalizedValue === 'apple' && productTitle && 
        productTitle.toLowerCase().includes('macbook')) {
      return false;
    }
  }
  
  // Finally, use the core matcher to check if it's a main category processor
  return !isMainCategoryProcessor(productValue, productTitle);
};
