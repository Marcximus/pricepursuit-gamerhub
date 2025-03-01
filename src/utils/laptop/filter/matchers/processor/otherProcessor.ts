
/**
 * "Other Processor" category matcher
 * Only matches processors that don't belong to any main category
 */
export const matchesOtherProcessor = (
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  // Import here to avoid circular dependencies
  const { isMainCategoryProcessor } = require('./processorMatcherCore');
  
  // If there's no processor info at all, don't categorize as "Other Processor"
  if (!productValue && !productTitle) {
    return false;
  }
  
  // Explicitly check for known processor patterns that should never be in "Other"
  const normalizedValue = (productValue || '').toLowerCase();
  const normalizedTitle = (productTitle || '').toLowerCase();
  
  // Apple Silicon patterns to explicitly exclude
  const applePatterns = [
    /\bm\d\b/, /\bm\d\s+chip\b/, /\bapple\s+m\d\b/, /\bm\d\s+(pro|max|ultra)\b/,
    /\bm\d[^\w]/, /\b[^\w]m\d\b/, /\bmacbook.*m\d\b/, /\bm\d.*chip\b/, /\bchip.*m\d\b/
  ];
  
  for (const pattern of applePatterns) {
    if (pattern.test(normalizedValue) || pattern.test(normalizedTitle)) {
      return false;
    }
  }
  
  // Check for Apple M-series references with more context
  if (normalizedTitle.includes('m2') && (
      normalizedTitle.includes('apple') || 
      normalizedTitle.includes('macbook') || 
      normalizedTitle.includes('chip') || 
      normalizedTitle.includes('processor')
    )) {
    return false;
  }
  
  // Only categorize as "Other Processor" if it doesn't match any main category
  return !isMainCategoryProcessor(productValue, productTitle);
};
