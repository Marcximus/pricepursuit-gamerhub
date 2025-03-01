
/**
 * Intel Celeron matcher
 */
export function matchesIntelCeleron(
  productValue: string | null | undefined,
  productTitle?: string
): boolean {
  // Check processor value
  if (productValue) {
    const normalizedProcessor = productValue.toLowerCase();
    
    if (normalizedProcessor.includes('celeron') || 
        normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
        normalizedProcessor.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i)) {
      return true;
    }
  }
  
  // Check title
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    if (normalizedTitle.includes('celeron') || 
        normalizedTitle.match(/\bceleron\s+n\d{4}\b/i) ||
        normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
        normalizedTitle.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Intel Pentium matcher
 */
export function matchesIntelPentium(
  productValue: string | null | undefined,
  productTitle?: string
): boolean {
  // Check processor value
  if (productValue) {
    const normalizedProcessor = productValue.toLowerCase();
    
    if (normalizedProcessor.includes('pentium') ||
        normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
        normalizedProcessor.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i)) {
      return true;
    }
  }
  
  // Check title
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    if (normalizedTitle.includes('pentium') ||
        normalizedTitle.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
        normalizedTitle.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i)) {
      return true;
    }
  }
  
  return false;
}
