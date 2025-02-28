
import { 
  appleSiliconPatterns, 
  intelCorePatterns,
  intelUltraPatterns,
  amdRyzenPatterns,
  generationPatterns
} from './processorPatterns';
import { 
  containsAppleProcessor, 
  containsIntelProcessor, 
  containsAmdProcessor,
  containsMobileProcessor
} from './extractorUtils';

/**
 * Standardizes processor information into categories for filtering
 */
export const standardizeProcessorForFiltering = (processor: string | null | undefined): string => {
  if (!processor) return 'Other Processor';
  
  const normalizedProcessor = processor.toLowerCase();
  
  // Detect Apple Silicon
  if (normalizedProcessor.includes('apple m4 ultra') || normalizedProcessor.includes('m4 ultra')) {
    return 'Apple M4 Ultra';
  }
  if (normalizedProcessor.includes('apple m4 max') || normalizedProcessor.includes('m4 max')) {
    return 'Apple M4 Max';
  }
  if (normalizedProcessor.includes('apple m4 pro') || normalizedProcessor.includes('m4 pro')) {
    return 'Apple M4 Pro';
  }
  if (normalizedProcessor.includes('apple m4') || normalizedProcessor.includes('m4 chip')) {
    return 'Apple M4';
  }
  
  if (normalizedProcessor.includes('apple m3 ultra') || normalizedProcessor.includes('m3 ultra')) {
    return 'Apple M3 Ultra';
  }
  if (normalizedProcessor.includes('apple m3 max') || normalizedProcessor.includes('m3 max')) {
    return 'Apple M3 Max';
  }
  if (normalizedProcessor.includes('apple m3 pro') || normalizedProcessor.includes('m3 pro')) {
    return 'Apple M3 Pro';
  }
  if (normalizedProcessor.includes('apple m3') || normalizedProcessor.includes('m3 chip')) {
    return 'Apple M3';
  }
  
  if (normalizedProcessor.includes('apple m2 ultra') || normalizedProcessor.includes('m2 ultra')) {
    return 'Apple M2 Ultra';
  }
  if (normalizedProcessor.includes('apple m2 max') || normalizedProcessor.includes('m2 max')) {
    return 'Apple M2 Max';
  }
  if (normalizedProcessor.includes('apple m2 pro') || normalizedProcessor.includes('m2 pro')) {
    return 'Apple M2 Pro';
  }
  if (normalizedProcessor.includes('apple m2') || normalizedProcessor.includes('m2 chip') || 
      normalizedProcessor.match(/\bm2\b/)) {
    return 'Apple M2';
  }
  
  if (normalizedProcessor.includes('apple m1 ultra') || normalizedProcessor.includes('m1 ultra')) {
    return 'Apple M1 Ultra';
  }
  if (normalizedProcessor.includes('apple m1 max') || normalizedProcessor.includes('m1 max')) {
    return 'Apple M1 Max';
  }
  if (normalizedProcessor.includes('apple m1 pro') || normalizedProcessor.includes('m1 pro')) {
    return 'Apple M1 Pro';
  }
  if (normalizedProcessor.includes('apple m1') || normalizedProcessor.includes('m1 chip') || 
      normalizedProcessor.match(/\bm1\b/)) {
    return 'Apple M1';
  }
  
  // Detect Intel Core Ultra
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
  
  // Detect core_i format (common in titles)
  if (normalizedProcessor.match(/\bcore_i([3579])\b/i)) {
    const coreNumber = normalizedProcessor.match(/core_i([3579])/i)?.[1];
    if (coreNumber) {
      return `Intel Core i${coreNumber}`;
    }
  }
  
  // Detect Intel Core i-series with generation info
  const intelGenMatch = normalizedProcessor.match(/i([3579])[\s-](\d{4,5})/i);
  if (intelGenMatch) {
    const coreNumber = intelGenMatch[1];
    const modelNumber = intelGenMatch[2];
    
    if (modelNumber.startsWith('13') || modelNumber.startsWith('14')) {
      return `Intel Core i${coreNumber} (13th/14th Gen)`;
    }
    if (modelNumber.startsWith('11') || modelNumber.startsWith('12')) {
      return `Intel Core i${coreNumber} (11th/12th Gen)`;
    }
    if (modelNumber.startsWith('10')) {
      return `Intel Core i${coreNumber} (10th Gen)`;
    }
  }
  
  // Check explicit generation mentions
  if (normalizedProcessor.includes('13th gen') || normalizedProcessor.includes('14th gen')) {
    if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9') || 
        normalizedProcessor.includes('core_i9')) {
      return 'Intel Core i9 (13th/14th Gen)';
    }
    if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7') || 
        normalizedProcessor.includes('core_i7')) {
      return 'Intel Core i7 (13th/14th Gen)';
    }
    if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5') || 
        normalizedProcessor.includes('core_i5')) {
      return 'Intel Core i5 (13th/14th Gen)';
    }
    if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3') || 
        normalizedProcessor.includes('core_i3')) {
      return 'Intel Core i3 (13th/14th Gen)';
    }
  }
  
  if (normalizedProcessor.includes('11th gen') || normalizedProcessor.includes('12th gen')) {
    if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9') || 
        normalizedProcessor.includes('core_i9')) {
      return 'Intel Core i9 (11th/12th Gen)';
    }
    if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7') || 
        normalizedProcessor.includes('core_i7')) {
      return 'Intel Core i7 (11th/12th Gen)';
    }
    if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5') || 
        normalizedProcessor.includes('core_i5')) {
      return 'Intel Core i5 (11th/12th Gen)';
    }
    if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3') || 
        normalizedProcessor.includes('core_i3')) {
      return 'Intel Core i3 (11th/12th Gen)';
    }
  }
  
  if (normalizedProcessor.includes('10th gen')) {
    if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9') || 
        normalizedProcessor.includes('core_i9')) {
      return 'Intel Core i9 (10th Gen)';
    }
    if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7') || 
        normalizedProcessor.includes('core_i7')) {
      return 'Intel Core i7 (10th Gen)';
    }
    if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5') || 
        normalizedProcessor.includes('core_i5')) {
      return 'Intel Core i5 (10th Gen)';
    }
    if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3') || 
        normalizedProcessor.includes('core_i3')) {
      return 'Intel Core i3 (10th Gen)';
    }
  }
  
  // Check for GHz processors with core numbers
  if (normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*i([3579])/i) ||
      normalizedProcessor.match(/i([3579]).*\d+(?:\.\d+)?\s*ghz/i) ||
      normalizedProcessor.match(/\d+(?:\.\d+)?\s*ghz.*core_i([3579])/i) ||
      normalizedProcessor.match(/core_i([3579]).*\d+(?:\.\d+)?\s*ghz/i)) {
    const coreNumber = normalizedProcessor.match(/i([3579])/i)?.[1] || 
                      normalizedProcessor.match(/core_i([3579])/i)?.[1];
    if (coreNumber) {
      return `Intel Core i${coreNumber}`;
    }
  }
  
  // Detect generic Intel Core i-series
  if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9') || 
      normalizedProcessor.match(/\bcore_i9\b/)) {
    return 'Intel Core i9';
  }
  if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7') || 
      normalizedProcessor.match(/\bcore_i7\b/)) {
    return 'Intel Core i7';
  }
  if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5') || 
      normalizedProcessor.match(/\bcore_i5\b/)) {
    return 'Intel Core i5';
  }
  if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3') || 
      normalizedProcessor.match(/\bcore_i3\b/)) {
    return 'Intel Core i3';
  }
  
  // Detect AMD Ryzen
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
  if (normalizedProcessor.includes('snapdragon')) {
    return 'Qualcomm Snapdragon';
  }
  if (normalizedProcessor.includes('mediatek')) {
    return 'MediaTek';
  }
  
  // If we can't categorize it, mark it as "Other"
  return 'Other Processor';
};
