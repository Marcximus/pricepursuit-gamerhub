
/**
 * Apple M-series processor matcher
 */
export const matchesAppleProcessor = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue && !productTitle) return false;
  
  const mVersion = filterValue.charAt(7); // Get the number (1-4)
  const isVariant = filterValue.length > 8;
  const variant = isVariant ? filterValue.substring(9).toLowerCase().trim() : '';
  
  // First check the title - prioritize this over the processor value
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    // Check for specific M-series mention with "chip" in title (highest priority pattern)
    if (normalizedTitle.match(new RegExp(`m${mVersion}\\s+chip`, 'i'))) {
      if (!isVariant) {
        // For base model, make sure no variant is mentioned
        return !normalizedTitle.includes('pro') && 
               !normalizedTitle.includes('max') && 
               !normalizedTitle.includes('ultra');
      } else if (normalizedTitle.includes(variant)) {
        // For variants, make sure the right variant is mentioned
        return true;
      }
    }
    
    // Look for M-series in context of Apple/MacBook
    if ((normalizedTitle.includes('apple') || normalizedTitle.includes('macbook')) && 
        normalizedTitle.includes(`m${mVersion}`)) {
      // For base M-series, make sure it's not a Pro/Max/Ultra variant
      if (!isVariant && 
          !normalizedTitle.includes('pro') && 
          !normalizedTitle.includes('max') && 
          !normalizedTitle.includes('ultra')) {
        return true;
      }
      // For variants (Pro/Max/Ultra)
      else if (isVariant && normalizedTitle.includes(variant)) {
        return true;
      }
    }
    
    // General pattern matching for M-series in title
    const regex = new RegExp(`\\bm${mVersion}\\b|\\bapple\\s*m${mVersion}\\b`, 'i');
    if (regex.test(normalizedTitle)) {
      // Don't match when it's about RAM/memory
      if (!normalizedTitle.includes('ram') && 
          !normalizedTitle.includes('memory') && 
          !normalizedTitle.includes('ssd')) {
        // For base M-series, make sure it's not a Pro/Max/Ultra variant
        if (!isVariant && 
            !normalizedTitle.includes('pro') && 
            !normalizedTitle.includes('max') && 
            !normalizedTitle.includes('ultra')) {
          return true;
        }
        // For variants (Pro/Max/Ultra)
        else if (isVariant && normalizedTitle.includes(variant)) {
          return true;
        }
      }
    }
  }
  
  // Fall back to checking the processor value if title doesn't match
  if (productValue) {
    const normalizedProcessor = productValue.toLowerCase();
    const regex = new RegExp(`\\bm${mVersion}\\b|\\bapple\\s*m${mVersion}\\b`, 'i');
    
    if (regex.test(normalizedProcessor)) {
      // For base M-series, make sure it's not a Pro/Max/Ultra variant
      if (!isVariant && 
          !normalizedProcessor.includes('pro') && 
          !normalizedProcessor.includes('max') && 
          !normalizedProcessor.includes('ultra')) {
        return true;
      }
      // For variants (Pro/Max/Ultra)
      else if (isVariant && normalizedProcessor.includes(variant)) {
        return true;
      }
    }
    
    // Check for "M{version} chip" pattern
    if (!isVariant && normalizedProcessor.match(new RegExp(`m${mVersion}\\s+chip`, 'i'))) {
      return true;
    }
  }
  
  return false;
};
