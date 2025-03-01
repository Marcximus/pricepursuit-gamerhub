
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
  
  // Improved Apple Silicon detection with more specific patterns
  // Check for specific models with variants first (most specific to least specific)
  
  // M4 Series
  if (normalizedProcessor.match(/\bapple\s+m4\s+ultra\b|\bm4\s+ultra\b/i)) {
    return 'Apple M4 Ultra';
  }
  if (normalizedProcessor.match(/\bapple\s+m4\s+max\b|\bm4\s+max\b/i)) {
    return 'Apple M4 Max';
  }
  if (normalizedProcessor.match(/\bapple\s+m4\s+pro\b|\bm4\s+pro\b/i)) {
    return 'Apple M4 Pro';
  }
  if (normalizedProcessor.match(/\bapple\s+m4\b|\bm4\s+chip\b|\bm4\b/i)) {
    return 'Apple M4';
  }
  
  // M3 Series
  if (normalizedProcessor.match(/\bapple\s+m3\s+ultra\b|\bm3\s+ultra\b/i)) {
    return 'Apple M3 Ultra';
  }
  if (normalizedProcessor.match(/\bapple\s+m3\s+max\b|\bm3\s+max\b/i)) {
    return 'Apple M3 Max';
  }
  if (normalizedProcessor.match(/\bapple\s+m3\s+pro\b|\bm3\s+pro\b/i)) {
    return 'Apple M3 Pro';
  }
  if (normalizedProcessor.match(/\bapple\s+m3\b|\bm3\s+chip\b|\bm3\b/i)) {
    return 'Apple M3';
  }
  
  // M2 Series - enhanced detection
  if (normalizedProcessor.match(/\bapple\s+m2\s+ultra\b|\bm2\s+ultra\b/i)) {
    return 'Apple M2 Ultra';
  }
  if (normalizedProcessor.match(/\bapple\s+m2\s+max\b|\bm2\s+max\b/i)) {
    return 'Apple M2 Max';
  }
  if (normalizedProcessor.match(/\bapple\s+m2\s+pro\b|\bm2\s+pro\b/i)) {
    return 'Apple M2 Pro';
  }
  // More aggressive M2 detection - match even standalone "m2" reference when not about RAM/memory
  if (normalizedProcessor.match(/\bapple\s+m2\b|\bm2\s+chip\b/i) || 
      (normalizedProcessor.match(/\bm2\b/i) && 
       !normalizedProcessor.includes('ram') && 
       !normalizedProcessor.includes('memory') && 
       !normalizedProcessor.includes('ssd'))) {
    return 'Apple M2';
  }
  
  // M1 Series - enhanced detection
  if (normalizedProcessor.match(/\bapple\s+m1\s+ultra\b|\bm1\s+ultra\b/i)) {
    return 'Apple M1 Ultra';
  }
  if (normalizedProcessor.match(/\bapple\s+m1\s+max\b|\bm1\s+max\b/i)) {
    return 'Apple M1 Max';
  }
  if (normalizedProcessor.match(/\bapple\s+m1\s+pro\b|\bm1\s+pro\b/i)) {
    return 'Apple M1 Pro';
  }
  // More aggressive M1 detection - match even standalone "m1" reference when not about RAM/memory
  if (normalizedProcessor.match(/\bapple\s+m1\b|\bm1\s+chip\b/i) || 
      (normalizedProcessor.match(/\bm1\b/i) && 
       !normalizedProcessor.includes('ram') && 
       !normalizedProcessor.includes('memory') && 
       !normalizedProcessor.includes('ssd'))) {
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
