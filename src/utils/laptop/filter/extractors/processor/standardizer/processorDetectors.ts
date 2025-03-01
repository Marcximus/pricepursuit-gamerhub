
// Detector functions for different processor types

/**
 * Detects Apple Silicon processors and returns standardized category
 */
export const detectAppleSilicon = (normalizedProcessor: string): string | null => {
  // M4 Series - all variants map to just "Apple M4"
  if (normalizedProcessor.match(/\bapple\s+m4\b|\bm4\s+chip\b|\bm4\b/i) ||
      normalizedProcessor.match(/\bapple\s+m4\s+(ultra|max|pro)\b|\bm4\s+(ultra|max|pro)\b/i)) {
    return 'Apple M4';
  }
  
  // M3 Series - all variants map to just "Apple M3"
  if (normalizedProcessor.match(/\bapple\s+m3\b|\bm3\s+chip\b|\bm3\b/i) ||
      normalizedProcessor.match(/\bapple\s+m3\s+(ultra|max|pro)\b|\bm3\s+(ultra|max|pro)\b/i)) {
    return 'Apple M3';
  }
  
  // M2 Series - all variants map to just "Apple M2"
  if (normalizedProcessor.match(/\bapple\s+m2\b|\bm2\s+chip\b/i) ||
      normalizedProcessor.match(/\bapple\s+m2\s+(ultra|max|pro)\b|\bm2\s+(ultra|max|pro)\b/i) ||
      normalizedProcessor.match(/\bmacbook.*m2(?:\s+chip)?\b/i) ||
      normalizedProcessor.match(/\bapple.*m2(?:\s+chip)?\b/i) ||
      (normalizedProcessor.match(/\bm2\b/i) && 
       !normalizedProcessor.includes('ram') && 
       !normalizedProcessor.includes('memory') && 
       !normalizedProcessor.includes('ssd')) ||
      (normalizedProcessor.includes('m2') && normalizedProcessor.includes('chip'))) {
    return 'Apple M2';
  }
  
  // M1 Series - all variants map to just "Apple M1"
  if (normalizedProcessor.match(/\bapple\s+m1\b|\bm1\s+chip\b/i) ||
      normalizedProcessor.match(/\bapple\s+m1\s+(ultra|max|pro)\b|\bm1\s+(ultra|max|pro)\b/i) ||
      (normalizedProcessor.match(/\bm1\b/i) && 
       !normalizedProcessor.includes('ram') && 
       !normalizedProcessor.includes('memory') && 
       !normalizedProcessor.includes('ssd')) ||
      (normalizedProcessor.includes('m1') && normalizedProcessor.includes('chip'))) {
    return 'Apple M1';
  }
  
  // If processor is just "Apple" and we're in a MacBook context, it might be an M-series chip
  if (normalizedProcessor === 'apple') {
    return 'Apple M-series';
  }
  
  // Check for Apple context without explicit M-series number
  if ((normalizedProcessor.includes('apple') || normalizedProcessor.includes('macbook')) && 
      (normalizedProcessor.includes('chip') || normalizedProcessor.includes('silicon'))) {
    // Look for M-series number anywhere in the string
    if (normalizedProcessor.match(/m2/i)) return 'Apple M2';
    if (normalizedProcessor.match(/m1/i)) return 'Apple M1';
    if (normalizedProcessor.match(/m3/i)) return 'Apple M3';
    if (normalizedProcessor.match(/m4/i)) return 'Apple M4';
  }
  
  return null;
};

/**
 * Detects Intel Core Ultra processors and returns standardized category
 */
export const detectIntelCoreUltra = (normalizedProcessor: string): string | null => {
  if (normalizedProcessor.match(/core\s+ultra\s+9|ultra\s+9|\d+-core\s+ultra\s+9/)) {
    return 'Intel Core Ultra 9';
  }
  if (normalizedProcessor.match(/core\s+ultra\s+7|ultra\s+7|\d+-core\s+ultra\s+7/)) {
    return 'Intel Core Ultra 7';
  }
  if (normalizedProcessor.match(/core\s+ultra\s+5|ultra\s+5|\d+-core\s+ultra\s+5/)) {
    return 'Intel Core Ultra 5';
  }
  if (normalizedProcessor.includes('core ultra') || normalizedProcessor.includes('intel ultra')) {
    return 'Intel Core Ultra';
  }
  
  return null;
};

/**
 * Detects Intel Core i-series processors and returns standardized category
 */
export const detectIntelCore = (normalizedProcessor: string): string | null => {
  // First check for explicit generation mentions in the processor string
  if (normalizedProcessor.includes('11th gen') || normalizedProcessor.includes('12th gen') ||
      normalizedProcessor.includes('13th gen') || normalizedProcessor.includes('14th gen') ||
      normalizedProcessor.includes('11th generation') || normalizedProcessor.includes('12th generation') ||
      normalizedProcessor.includes('13th generation') || normalizedProcessor.includes('14th generation')) {
    if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9') || 
        normalizedProcessor.includes('core_i9')) {
      return 'Intel Core i9 (11th-14th Gen)';
    }
    if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7') || 
        normalizedProcessor.includes('core_i7')) {
      return 'Intel Core i7 (11th-14th Gen)';
    }
    if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5') || 
        normalizedProcessor.includes('core_i5')) {
      return 'Intel Core i5 (11th-14th Gen)';
    }
    if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3') || 
        normalizedProcessor.includes('core_i3')) {
      return 'Intel Core i3 (11th-14th Gen)';
    }
  }
  
  if (normalizedProcessor.includes('8th gen') || normalizedProcessor.includes('9th gen') ||
      normalizedProcessor.includes('10th gen') || normalizedProcessor.includes('8th generation') || 
      normalizedProcessor.includes('9th generation') || normalizedProcessor.includes('10th generation')) {
    if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9') || 
        normalizedProcessor.includes('core_i9')) {
      return 'Intel Core i9 (8th-10th Gen)';
    }
    if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7') || 
        normalizedProcessor.includes('core_i7')) {
      return 'Intel Core i7 (8th-10th Gen)';
    }
    if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5') || 
        normalizedProcessor.includes('core_i5')) {
      return 'Intel Core i5 (8th-10th Gen)';
    }
    if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3') || 
        normalizedProcessor.includes('core_i3')) {
      return 'Intel Core i3 (8th-10th Gen)';
    }
  }
  
  if (normalizedProcessor.includes('2nd gen') || normalizedProcessor.includes('3rd gen') ||
      normalizedProcessor.includes('4th gen') || normalizedProcessor.includes('5th gen') ||
      normalizedProcessor.includes('6th gen') || normalizedProcessor.includes('7th gen') ||
      normalizedProcessor.includes('2nd generation') || normalizedProcessor.includes('3rd generation') ||
      normalizedProcessor.includes('4th generation') || normalizedProcessor.includes('5th generation') ||
      normalizedProcessor.includes('6th generation') || normalizedProcessor.includes('7th generation')) {
    if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9') || 
        normalizedProcessor.includes('core_i9')) {
      return 'Intel Core i9 (8th-10th Gen)'; // i9 didn't exist before 8th gen
    }
    if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7') || 
        normalizedProcessor.includes('core_i7')) {
      return 'Intel Core i7 (2nd-7th Gen)';
    }
    if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5') || 
        normalizedProcessor.includes('core_i5')) {
      return 'Intel Core i5 (2nd-7th Gen)';
    }
    if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3') || 
        normalizedProcessor.includes('core_i3')) {
      return 'Intel Core i3 (2nd-7th Gen)';
    }
  }
  
  // Check for model numbers that indicate generation
  const intelGenMatch = normalizedProcessor.match(/i([3579])[\s-](\d{4,5})/i);
  if (intelGenMatch) {
    const coreNumber = intelGenMatch[1];
    const modelNumber = intelGenMatch[2];
    
    // Enhanced generation detection from model numbers with consolidated ranges
    if (modelNumber.startsWith('11') || modelNumber.startsWith('12') || 
        modelNumber.startsWith('13') || modelNumber.startsWith('14')) {
      return `Intel Core i${coreNumber} (11th-14th Gen)`;
    }
    if (modelNumber.startsWith('8') || modelNumber.startsWith('9') || modelNumber.startsWith('10')) {
      return `Intel Core i${coreNumber} (8th-10th Gen)`;
    }
    if (modelNumber.startsWith('2') || modelNumber.startsWith('3') || 
        modelNumber.startsWith('4') || modelNumber.startsWith('5') ||
        modelNumber.startsWith('6') || modelNumber.startsWith('7')) {
      return `Intel Core i${coreNumber} (2nd-7th Gen)`;
    }
  }
  
  // Try to detect core-i patterns without model numbers, assigning to oldest generation
  // Detect core_i format (common in titles)
  if (normalizedProcessor.match(/\bcore_i([3579])\b/i)) {
    const coreNumber = normalizedProcessor.match(/core_i([3579])/i)?.[1];
    if (coreNumber) {
      return `Intel Core i${coreNumber} (2nd-7th Gen)`;
    }
  }
  
  // Check for GHz processors with core numbers, now assigning to oldest generation
  if (normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*i([3579])/i) ||
      normalizedProcessor.match(/i([3579]).*\d+(?:\.\d+)?\s*ghz/i) ||
      normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*core_i([3579])/i) ||
      normalizedProcessor.match(/core_i([3579]).*\d+(?:\.\d+)?\s*ghz/i)) {
    const coreNumber = normalizedProcessor.match(/i([3579])/i)?.[1] || 
                      normalizedProcessor.match(/core_i([3579])/i)?.[1];
    if (coreNumber) {
      return `Intel Core i${coreNumber} (2nd-7th Gen)`;
    }
  }
  
  // Generic Intel Core i-series without generation or model - now assigning to oldest generation
  if (normalizedProcessor.includes('i9') || normalizedProcessor.match(/\bcore\s*i9\b/)) {
    return 'Intel Core i9 (8th-10th Gen)'; // i9 started in 8th gen
  }
  if (normalizedProcessor.includes('i7') || normalizedProcessor.match(/\bcore\s*i7\b/)) {
    return 'Intel Core i7 (2nd-7th Gen)';
  }
  if (normalizedProcessor.includes('i5') || normalizedProcessor.match(/\bcore\s*i5\b/)) {
    return 'Intel Core i5 (2nd-7th Gen)';
  }
  if (normalizedProcessor.includes('i3') || normalizedProcessor.match(/\bcore\s*i3\b/)) {
    return 'Intel Core i3 (2nd-7th Gen)';
  }
  
  return null;
};

/**
 * Detects AMD Ryzen processors and returns standardized category
 */
export const detectAMDRyzen = (normalizedProcessor: string): string | null => {
  if (normalizedProcessor.includes('ryzen 9') || normalizedProcessor.includes('ryzen_9')) {
    return 'AMD Ryzen 9';
  }
  if (normalizedProcessor.includes('ryzen 7') || normalizedProcessor.includes('ryzen_7')) {
    return 'AMD Ryzen 7';
  }
  if (normalizedProcessor.includes('ryzen 5') || normalizedProcessor.includes('ryzen_5')) {
    return 'AMD Ryzen 5';
  }
  if (normalizedProcessor.includes('ryzen 3') || normalizedProcessor.includes('ryzen_3')) {
    return 'AMD Ryzen 3';
  }
  
  // Detect AMD Ryzen with model numbers (like 3500u)
  const ryzenModelMatch = normalizedProcessor.match(/ryzen[_\s-]*([3579])[_\s-](\d{4}[a-z]*)/i);
  if (ryzenModelMatch) {
    const ryzenSeries = ryzenModelMatch[1];
    return `AMD Ryzen ${ryzenSeries}`;
  }
  
  return null;
};

/**
 * Detects budget processors like Intel Celeron and Pentium
 */
export const detectBudgetProcessors = (normalizedProcessor: string): string | null => {
  // Check for GHz with Celeron
  if ((normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
       normalizedProcessor.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i)) && 
      normalizedProcessor.includes('celeron')) {
    return 'Intel Celeron';
  }
  
  // Check for GHz with Pentium
  if ((normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
       normalizedProcessor.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i)) && 
      normalizedProcessor.includes('pentium')) {
    return 'Intel Pentium';
  }
  
  // Detect other common processor types
  if (normalizedProcessor.includes('celeron')) {
    return 'Intel Celeron';
  }
  if (normalizedProcessor.includes('pentium')) {
    return 'Intel Pentium';
  }
  
  return null;
};

/**
 * Detects mobile processors like Snapdragon and MediaTek
 */
export const detectMobileProcessors = (normalizedProcessor: string): string | null => {
  if (normalizedProcessor.includes('snapdragon')) {
    return 'Qualcomm Snapdragon';
  }
  if (normalizedProcessor.includes('mediatek')) {
    return 'MediaTek';
  }
  
  return null;
};
