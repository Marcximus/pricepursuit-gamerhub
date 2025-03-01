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
  
  // Match Intel Core i-series with specific generation info
  if (filterValue.includes('Intel Core i') && filterValue.includes('Gen')) {
    return matchesIntelCoreWithGeneration(filterValue, productValue, productTitle);
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
 * Intel Core i-series with generation matcher, updated for consolidated generation groups
 */
function matchesIntelCoreWithGeneration(
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean {
  let coreNumber: string | null = null;
  let genInfo: string[] = [];
  
  // Extract core number
  const coreMatch = filterValue.match(/i([3579])/);
  if (coreMatch) {
    coreNumber = coreMatch[1];
  }
  
  // Extract generation info based on the consolidated groups
  if (filterValue.includes('11th-14th')) {
    genInfo = ['11th', '12th', '13th', '14th', '11', '12', '13', '14'];
  } else if (filterValue.includes('8th-10th')) {
    genInfo = ['8th', '9th', '10th', '8', '9', '10'];
  } else if (filterValue.includes('2nd-7th')) {
    genInfo = ['2nd', '3rd', '4th', '5th', '6th', '7th', '2', '3', '4', '5', '6', '7'];
  }
  
  // Check processor value
  if (productValue && coreNumber) {
    const normalizedProcessor = productValue.toLowerCase();
    
    // Check for exact match of generation info in the processor value
    if (genInfo.length > 0) {
      const hasGenInfo = genInfo.some(gen => normalizedProcessor.includes(gen));
      const hasCorrectCore = normalizedProcessor.includes(`i${coreNumber}`) || 
                             normalizedProcessor.includes(`core i${coreNumber}`) ||
                             normalizedProcessor.includes(`core_i${coreNumber}`);
      
      if (hasGenInfo && hasCorrectCore) {
        return true;
      }
      
      // Check for model numbers that indicate generation
      const modelMatch = normalizedProcessor.match(new RegExp(`i${coreNumber}[\\s-](\\d{4,5}[a-z]*)`, 'i'));
      if (modelMatch) {
        const modelNumber = modelMatch[1];
        
        // Check first digits of model number to determine generation
        const firstDigit = modelNumber.charAt(0);
        
        // 11th-14th Gen
        if (filterValue.includes('11th-14th') && 
            ((firstDigit === '1' && ['1', '2', '3', '4'].includes(modelNumber.charAt(1))))) {
          return true;
        }
        
        // 8th-10th Gen
        if (filterValue.includes('8th-10th') && 
            (firstDigit === '8' || firstDigit === '9' || 
             (firstDigit === '1' && modelNumber.charAt(1) === '0'))) {
          return true;
        }
        
        // 2nd-7th Gen
        if (filterValue.includes('2nd-7th') && 
            ['2', '3', '4', '5', '6', '7'].includes(firstDigit)) {
          return true;
        }
      }
    }
    
    // For oldest generation, match processors without specific generation info
    if (filterValue.includes('2nd-7th') && 
        (normalizedProcessor.match(new RegExp(`\\bi${coreNumber}\\b`, 'i')) || 
         normalizedProcessor.match(new RegExp(`\\bcore\\s*i${coreNumber}\\b`, 'i')) ||
         normalizedProcessor.match(new RegExp(`\\bcore_i${coreNumber}\\b`, 'i'))) && 
        !normalizedProcessor.match(/\d+th\s+gen|\d+\s+gen|\d+th\s+generation/i) &&
        !normalizedProcessor.match(/i${coreNumber}[\s-]\d{4,5}/i)) {
      return true;
    }
  }
  
  // Check title
  if (productTitle && coreNumber) {
    const normalizedTitle = productTitle.toLowerCase();
    
    // Check for exact match of generation info in the title
    if (genInfo.length > 0) {
      const hasGenInfo = genInfo.some(gen => normalizedTitle.includes(gen));
      const hasCorrectCore = normalizedTitle.includes(`i${coreNumber}`) || 
                             normalizedTitle.includes(`core i${coreNumber}`) ||
                             normalizedTitle.includes(`core_i${coreNumber}`);
      
      if (hasGenInfo && hasCorrectCore) {
        return true;
      }
      
      // Check for model numbers that indicate generation
      const modelMatch = normalizedTitle.match(new RegExp(`i${coreNumber}[\\s-](\\d{4,5}[a-z]*)`, 'i'));
      if (modelMatch) {
        const modelNumber = modelMatch[1];
        
        // Check first digits of model number to determine generation
        const firstDigit = modelNumber.charAt(0);
        
        // 11th-14th Gen
        if (filterValue.includes('11th-14th') && 
            ((firstDigit === '1' && ['1', '2', '3', '4'].includes(modelNumber.charAt(1))))) {
          return true;
        }
        
        // 8th-10th Gen
        if (filterValue.includes('8th-10th') && 
            (firstDigit === '8' || firstDigit === '9' || 
             (firstDigit === '1' && modelNumber.charAt(1) === '0'))) {
          return true;
        }
        
        // 2nd-7th Gen
        if (filterValue.includes('2nd-7th') && 
            ['2', '3', '4', '5', '6', '7'].includes(firstDigit)) {
          return true;
        }
      }
    }
    
    // For oldest generation, match titles without specific generation info
    if (filterValue.includes('2nd-7th') && 
        (normalizedTitle.match(new RegExp(`\\bi${coreNumber}\\b`, 'i')) || 
         normalizedTitle.match(new RegExp(`\\bcore\\s*i${coreNumber}\\b`, 'i')) ||
         normalizedTitle.match(new RegExp(`\\bcore_i${coreNumber}\\b`, 'i'))) && 
        !normalizedTitle.match(/\d+th\s+gen|\d+\s+gen|\d+th\s+generation/i) &&
        !normalizedTitle.match(/i${coreNumber}[\s-]\d{4,5}/i)) {
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
