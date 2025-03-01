
/**
 * Apple M-series processor matcher - simplified for consolidated categories
 */
export const matchesAppleProcessor = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue && !productTitle) return false;
  
  // Get the M-series version number (1-4)
  const mVersion = filterValue.charAt(7); 
  
  // First check the title - prioritize this over the processor value
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    // Enhanced detection for MacBook Air/Pro with M-series chips mentioned in title
    if (normalizedTitle.includes('macbook') && normalizedTitle.includes(`m${mVersion}`)) {
      return true;
    }
    
    // Check for specific M-series mention with "chip" in title (highest priority pattern)
    if (normalizedTitle.match(new RegExp(`m${mVersion}\\s+chip`, 'i'))) {
      return true;
    }
    
    // Look for M-series in context of Apple/MacBook
    if ((normalizedTitle.includes('apple') || normalizedTitle.includes('macbook')) && 
        normalizedTitle.includes(`m${mVersion}`)) {
      return true;
    }
    
    // General pattern matching for M-series in title
    const regex = new RegExp(`\\bm${mVersion}\\b|\\bapple\\s*m${mVersion}\\b`, 'i');
    if (regex.test(normalizedTitle)) {
      // Don't match when it's about RAM/memory
      if (!normalizedTitle.includes('ram') && 
          !normalizedTitle.includes('memory') && 
          !normalizedTitle.includes('ssd')) {
        return true;
      }
    }
    
    // Also check for variant mentions (Pro/Max/Ultra) with the same M-series version
    if (normalizedTitle.includes(`m${mVersion} pro`) || 
        normalizedTitle.includes(`m${mVersion} max`) || 
        normalizedTitle.includes(`m${mVersion} ultra`)) {
      return true;
    }
  }
  
  // Special handling for when processor value is just "Apple"
  if (productValue === 'Apple' && productTitle && productTitle.toLowerCase().includes(`m${mVersion}`)) {
    return true;
  }
  
  // Fall back to checking the processor value if title doesn't match
  if (productValue) {
    const normalizedProcessor = productValue.toLowerCase();
    
    // Match main version or any variant (Pro/Max/Ultra)
    if (normalizedProcessor.includes(`m${mVersion}`) || 
        normalizedProcessor.includes(`apple m${mVersion}`)) {
      return true;
    }
    
    // Check for "M{version} chip" pattern
    if (normalizedProcessor.match(new RegExp(`m${mVersion}\\s+chip`, 'i'))) {
      return true;
    }
    
    // Also check for variant mentions
    if (normalizedProcessor.includes(`m${mVersion} pro`) || 
        normalizedProcessor.includes(`m${mVersion} max`) || 
        normalizedProcessor.includes(`m${mVersion} ultra`)) {
      return true;
    }
  }
  
  return false;
};
