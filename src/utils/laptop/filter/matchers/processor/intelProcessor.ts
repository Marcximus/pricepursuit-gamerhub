
/**
 * Intel processor matcher (Core i-series, Core Ultra, Celeron, Pentium)
 */
export const matchesIntelProcessor = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue && !productTitle) return false;
  
  // Match Intel Core Ultra series
  if (filterValue.startsWith('Intel Core Ultra')) {
    return matchesIntelCoreUltra(filterValue, productValue, productTitle);
  }
  
  // Match Intel Core i-series
  if (filterValue.includes('Intel Core i')) {
    return matchesIntelCoreSeries(filterValue, productValue, productTitle);
  }
  
  // Match Intel Celeron
  if (filterValue === 'Intel Celeron') {
    return matchesIntelCeleron(productValue, productTitle);
  }
  
  // Match Intel Pentium
  if (filterValue === 'Intel Pentium') {
    return matchesIntelPentium(productValue, productTitle);
  }
  
  return false;
};

/**
 * Intel Core Ultra series matcher
 */
function matchesIntelCoreUltra(
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean {
  const ultraNumber = filterValue.split(' ').pop(); // Get the number (5,7,9)
  
  // Check processor value
  if (productValue) {
    const normalizedProcessor = productValue.toLowerCase();
    
    if (normalizedProcessor.includes('core ultra') || 
        normalizedProcessor.includes('intel ultra') ||
        normalizedProcessor.match(/\d+-core\s+ultra/i)) {
      
      if (ultraNumber && 
          (normalizedProcessor.includes(`ultra ${ultraNumber}`) || 
           normalizedProcessor.includes(`ultra${ultraNumber}`) ||
           normalizedProcessor.match(new RegExp(`\\bultra\\s*${ultraNumber}\\b`, 'i')) ||
           normalizedProcessor.match(new RegExp(`\\bcore\\s*ultra\\s*${ultraNumber}\\b`, 'i')))) {
        return true;
      }
    }
  }
  
  // Check title
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    if (normalizedTitle.includes('core ultra') || normalizedTitle.includes('-core ultra')) {
      
      if (ultraNumber && 
          (normalizedTitle.includes(`ultra ${ultraNumber}`) || 
           normalizedTitle.includes(`core ultra ${ultraNumber}`))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Intel Core i-series matcher
 */
function matchesIntelCoreSeries(
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean {
  let coreNumber = null;
  let genInfo: string[] = [];
  
  // Extract core number
  const coreMatch = filterValue.match(/i([3579])/);
  if (coreMatch) {
    coreNumber = coreMatch[1];
  }
  
  // Extract generation info if present
  if (filterValue.includes('13th/14th')) {
    genInfo = ['13th', '14th', '13', '14'];
  } else if (filterValue.includes('11th/12th')) {
    genInfo = ['11th', '12th', '11', '12'];
  } else if (filterValue.includes('10th')) {
    genInfo = ['10th', '10'];
  }
  
  // Check processor value
  if (productValue && coreNumber) {
    const normalizedProcessor = productValue.toLowerCase();
    
    // Check for specific generation if in filter
    if (genInfo.length > 0 && genInfo.some(gen => normalizedProcessor.includes(gen))) {
      return normalizedProcessor.includes(`i${coreNumber}`) || 
             normalizedProcessor.includes(`core i${coreNumber}`) ||
             normalizedProcessor.includes(`core_i${coreNumber}`);
    }
    
    // Basic Core i# format without generation
    if (filterValue.length === 12) {
      // Match patterns like i7, i7-xxxx, Core i7, Intel i7
      const coreRegex = new RegExp(`\\bi${coreNumber}\\b|\\bcore\\s*i${coreNumber}\\b|\\bcore_i${coreNumber}\\b`, 'i');
      if (coreRegex.test(normalizedProcessor)) {
        return true;
      }
      
      // Match GHz Core i7 patterns
      if (normalizedProcessor.match(new RegExp(`\\d+(?:\\.\\d+)?\\s*ghz.*(?:core\\s*)?i${coreNumber}\\b`, 'i')) ||
          normalizedProcessor.match(new RegExp(`(?:core\\s*)?i${coreNumber}.*\\d+(?:\\.\\d+)?\\s*ghz`, 'i'))) {
        return true;
      }
    }
    
    // Match model numbers for Intel processors
    if (normalizedProcessor.match(new RegExp(`i${coreNumber}-\\d{4,5}[a-z]*`, 'i'))) {
      return true;
    }
  }
  
  // Check title
  if (productTitle && coreNumber) {
    const normalizedTitle = productTitle.toLowerCase();
    
    // Check for specific generation if in filter
    if (genInfo.length > 0 && genInfo.some(gen => normalizedTitle.includes(gen))) {
      return normalizedTitle.includes(`i${coreNumber}`) || 
             normalizedTitle.includes(`core i${coreNumber}`) ||
             normalizedTitle.includes(`core_i${coreNumber}`);
    }
    
    // Match patterns like "Intel Core i5-1135G7" or just "i5" in title
    if (coreNumber && 
        (normalizedTitle.match(new RegExp(`i${coreNumber}[- ]\\d{4,5}[a-z]*`, 'i')) || 
         normalizedTitle.match(new RegExp(`\\bi${coreNumber}\\b`, 'i')) ||
         normalizedTitle.match(new RegExp(`\\bcore_i${coreNumber}\\b`, 'i')))) {
      return true;
    }
    
    // Match GHz mentions with core numbers in title
    if (normalizedTitle.match(new RegExp(`\\d+(?:\\.\\d+)?\\s*ghz.*(?:core\\s*)?i${coreNumber}`, 'i')) ||
        normalizedTitle.match(new RegExp(`(?:core\\s*)?i${coreNumber}.*\\d+(?:\\.\\d+)?\\s*ghz`, 'i')) ||
        normalizedTitle.match(new RegExp(`\\d+(?:\\.\\d+)?\\s*ghz.*core_i${coreNumber}`, 'i')) ||
        normalizedTitle.match(new RegExp(`core_i${coreNumber}.*\\d+(?:\\.\\d+)?\\s*ghz`, 'i'))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Intel Celeron matcher
 */
function matchesIntelCeleron(
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
function matchesIntelPentium(
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
