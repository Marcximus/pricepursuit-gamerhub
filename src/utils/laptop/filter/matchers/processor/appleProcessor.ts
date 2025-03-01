
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
  
  // Check processor value first
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
  
  // If not found in processor value, check the title
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    const regex = new RegExp(`\\bm${mVersion}\\b|\\bapple\\s*m${mVersion}\\b`, 'i');
    
    if (regex.test(normalizedTitle)) {
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
    
    // Check for "M{version} chip" pattern in title
    if (!isVariant && normalizedTitle.match(new RegExp(`m${mVersion}\\s+chip`, 'i'))) {
      return true;
    }
    
    // Check for Apple context with M-series
    if ((normalizedTitle.includes('apple') || normalizedTitle.includes('macbook')) && 
        normalizedTitle.includes(`m${mVersion}`) &&
        !normalizedTitle.includes('ram') && 
        !normalizedTitle.includes('memory')) {
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
  
  return false;
};
