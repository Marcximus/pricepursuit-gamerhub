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
 * Intel Core i-series with generation matcher
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
  
  // Extract generation info
  if (filterValue.includes('13th/14th')) {
    genInfo = ['13th', '14th', '13', '14'];
  } else if (filterValue.includes('11th/12th')) {
    genInfo = ['11th', '12th', '11', '12'];
  } else if (filterValue.includes('10th')) {
    genInfo = ['10th', '10'];
  } else if (filterValue.includes('8th/9th')) {
    genInfo = ['8th', '9th', '8', '9'];
  } else if (filterValue.includes('6th/7th')) {
    genInfo = ['6th', '7th', '6', '7'];
  } else if (filterValue.includes('4th/5th')) {
    genInfo = ['4th', '5th', '4', '5'];
  } else if (filterValue.includes('2nd/3rd')) {
    genInfo = ['2nd', '3rd', '2', '3'];
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
        if ((genInfo.includes('13') || genInfo.includes('14')) && 
            (firstDigit === '1' && (modelNumber.charAt(1) === '3' || modelNumber.charAt(1) === '4'))) {
          return true;
        }
        if ((genInfo.includes('11') || genInfo.includes('12')) && 
            (firstDigit === '1' && (modelNumber.charAt(1) === '1' || modelNumber.charAt(1) === '2'))) {
          return true;
        }
        if (genInfo.includes('10') && firstDigit === '1' && modelNumber.charAt(1) === '0') {
          return true;
        }
        if ((genInfo.includes('8') || genInfo.includes('9')) && 
            (firstDigit === '8' || firstDigit === '9')) {
          return true;
        }
        if ((genInfo.includes('6') || genInfo.includes('7')) && 
            (firstDigit === '6' || firstDigit === '7')) {
          return true;
        }
        if ((genInfo.includes('4') || genInfo.includes('5')) && 
            (firstDigit === '4' || firstDigit === '5')) {
          return true;
        }
        if ((genInfo.includes('2') || genInfo.includes('3')) && 
            (firstDigit === '2' || firstDigit === '3')) {
          return true;
        }
      }
    }
    
    // For oldest generation, match processors without specific generation info
    if (filterValue.includes('2nd/3rd') && 
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
        if ((genInfo.includes('13') || genInfo.includes('14')) && 
            (firstDigit === '1' && (modelNumber.charAt(1) === '3' || modelNumber.charAt(1) === '4'))) {
          return true;
        }
        if ((genInfo.includes('11') || genInfo.includes('12')) && 
            (firstDigit === '1' && (modelNumber.charAt(1) === '1' || modelNumber.charAt(1) === '2'))) {
          return true;
        }
        if (genInfo.includes('10') && firstDigit === '1' && modelNumber.charAt(1) === '0') {
          return true;
        }
        if ((genInfo.includes('8') || genInfo.includes('9')) && 
            (firstDigit === '8' || firstDigit === '9')) {
          return true;
        }
        if ((genInfo.includes('6') || genInfo.includes('7')) && 
            (firstDigit === '6' || firstDigit === '7')) {
          return true;
        }
        if ((genInfo.includes('4') || genInfo.includes('5')) && 
            (firstDigit === '4' || firstDigit === '5')) {
          return true;
        }
        if ((genInfo.includes('2') || genInfo.includes('3')) && 
            (firstDigit === '2' || firstDigit === '3')) {
          return true;
        }
      }
    }
    
    // For oldest generation, match titles without specific generation info
    if (filterValue.includes('2nd/3rd') && 
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
