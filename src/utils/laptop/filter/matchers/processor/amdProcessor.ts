
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
      
      // Match specific model numbers like 3500u
      if (normalizedProcessor.match(new RegExp(`\\bryzen[_\\s-]*${ryzenNumber}[_\\s-]\\d{4}[a-z]?\\b`, 'i'))) {
        return true;
      }
    }
  }
  
  // Check title
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    if (normalizedTitle.includes('ryzen') || normalizedTitle.includes('amd')) {
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
  
  return false;
};
