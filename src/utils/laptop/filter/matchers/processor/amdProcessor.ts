
/**
 * AMD Ryzen processor matcher
 */
export const matchesAmdProcessor = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue && !productTitle) return false;
  
  const ryzenNumber = filterValue.split(' ').pop(); // Get the number (3,5,7,9)
  
  // Check processor value
  if (productValue) {
    const normalizedProcessor = productValue.toLowerCase();
    
    if (normalizedProcessor.includes('ryzen') || normalizedProcessor.includes('amd')) {
      // Match patterns like ryzen 5, ryzen5, ryzen_5, ryzen-5
      const ryzenRegex = new RegExp(`\\bryzen[_\\s-]*${ryzenNumber}\\b`, 'i');
      if (ryzenRegex.test(normalizedProcessor)) {
        return true;
      }
      
      // Match AMD R5, R7 patterns
      const amdRRegex = new RegExp(`\\br${ryzenNumber}\\b`, 'i');
      if (normalizedProcessor.includes('amd') && amdRRegex.test(normalizedProcessor)) {
        return true;
      }
      
      // Match specific model numbers like 3500u
      if (normalizedProcessor.match(new RegExp(`\\bryzen[_\\s-]*${ryzenNumber}[_\\s-]\\d{4}[a-z]?\\b`, 'i'))) {
        return true;
      }
      
      // Match AMD R5-3500U patterns
      if (normalizedProcessor.match(new RegExp(`\\br${ryzenNumber}[_\\s-]\\d{4}[a-z]?\\b`, 'i'))) {
        return true;
      }
      
      // Match patterns with trademark symbols
      const ryzenTrademarkRegex = new RegExp(`\\bryzen(?:™|\\s+™)?\\s*${ryzenNumber}\\b`, 'i');
      if (normalizedProcessor.includes('amd') && ryzenTrademarkRegex.test(normalizedProcessor)) {
        return true;
      }
    }
  }
  
  // Check title with improved pattern matching
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    if (normalizedTitle.includes('ryzen') || normalizedTitle.includes('amd')) {
      // Match patterns like ryzen 5, ryzen5, ryzen_5, ryzen-5
      const ryzenRegex = new RegExp(`\\bryzen[_\\s-]*${ryzenNumber}\\b`, 'i');
      if (ryzenRegex.test(normalizedTitle)) {
        return true;
      }
      
      // Match AMD R5, R7 patterns
      const amdRRegex = new RegExp(`\\br${ryzenNumber}\\b`, 'i');
      if (normalizedTitle.includes('amd') && amdRRegex.test(normalizedTitle)) {
        return true;
      }
      
      // Match specific model numbers like 3500u
      if (normalizedTitle.match(new RegExp(`\\bryzen[_\\s-]*${ryzenNumber}[_\\s-]\\d{4}[a-z]?\\b`, 'i'))) {
        return true;
      }
      
      // Match AMD R5-3500U patterns
      if (normalizedTitle.match(new RegExp(`\\br${ryzenNumber}[_\\s-]\\d{4}[a-z]?\\b`, 'i'))) {
        return true;
      }
      
      // Match AMD Ryzen™ 5 patterns with trademark symbols
      const ryzenTrademarkRegex = new RegExp(`\\bryzen(?:™|\\s+™)?\\s*${ryzenNumber}\\b`, 'i');
      if (normalizedTitle.includes('amd') && ryzenTrademarkRegex.test(normalizedTitle)) {
        return true;
      }
    }
  }
  
  return false;
};
