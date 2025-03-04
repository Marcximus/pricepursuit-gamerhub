
/**
 * Normalizes processor strings for consistent display and filtering
 */
export const normalizeProcessor = (processor: string): string => {
  if (!processor) return '';
  
  // Clean up common inconsistencies
  let normalized = processor
    .replace(/\s+/g, ' ')
    .replace(/Processor:?/i, '')
    .replace(/CPU:?/i, '')
    .trim();
  
  // Filter out invalid processor descriptions
  if (normalized.length < 3 || 
      normalized.includes('undefined') || 
      normalized.includes('N/A')) {
    return '';
  }
  
  // Remove other component specs that got mixed in with the processor
  normalized = normalized
    .replace(/(\d+\s*GB\s*(RAM|Memory|DDR\d*))/i, '')
    .replace(/(\d+\s*(GB|TB)\s*(SSD|HDD|Storage))/i, '')
    .replace(/(\d+(\.\d+)?\s*inch)/i, '')
    .replace(/\b(USB|HDMI|Windows|WiFi|Bluetooth)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
    
  // Standardize Intel Ultra naming
  normalized = normalized
    .replace(/intel\s+(?:core\s+)?ultra\s+([579])(?:-|_|\s+)(\d{3}[a-z]*)/i, 'Intel Core Ultra $1-$2')
    .replace(/intel\s+(?:core\s+)?ultra\s+([579])/i, 'Intel Core Ultra $1');
  
  // Standardize Intel naming
  normalized = normalized
    .replace(/intel\s+core\s+i([3579])[- ](\d{4,5})(H|U|HQ|K)?/i, 'Intel Core i$1-$2$3')
    .replace(/intel\s+core\s+i([3579])[- ](\d{1,2}th)\s+gen/i, 'Intel Core i$1 $2 Gen')
    .replace(/intel\s+core\s+i([3579])/i, 'Intel Core i$1')
    .replace(/\bi([3579])[- ](\d{4,5})(H|U|HQ|K)?/i, 'Intel Core i$1-$2$3')
    .replace(/\bi([3579])\b/i, 'Intel Core i$1')
    .replace(/\bcore_i([3579])\b/i, 'Intel Core i$1')
    .replace(/intel\s+celeron\s+(n\d{4})/i, 'Intel Celeron $1')
    .replace(/intel\s+celeron/i, 'Intel Celeron')
    .replace(/intel\s+pentium/i, 'Intel Pentium')
    .replace(/(\d+)-core\s+ultra\s+([579])/i, 'Intel Core Ultra $2 ($1-core)');
    
  // Standardize AMD naming
  normalized = normalized
    .replace(/amd\s+ryzen\s+([3579])[- ](\d{4,5}[A-Z]*(?:\s*HX)?)/i, 'AMD Ryzen $1-$2')
    .replace(/amd\s+ryzen\s+([3579])/i, 'AMD Ryzen $1')
    .replace(/ryzen\s+([3579])[- ](\d{4,5}[A-Z]*(?:\s*HX)?)/i, 'AMD Ryzen $1-$2')
    .replace(/ryzen\s+([3579])/i, 'AMD Ryzen $1')
    .replace(/ryzen_([3579])_(\d{4}[a-z]*)/i, 'AMD Ryzen $1-$2');
    
  // Apple naming
  normalized = normalized
    .replace(/apple\s+m(\d)(\s+(pro|max|ultra))?(\s+chip)?/i, 'Apple M$1$2 chip')
    .replace(/m(\d)(\s+(pro|max|ultra))?(\s+chip)?/i, 'Apple M$1$2 chip')
    // Make sure "chip" is always added for Apple processors
    .replace(/apple\s+m(\d)(\s+(pro|max|ultra))?$/i, 'Apple M$1$2 chip');
    
  // Standardize GHz mentions with processor models
  normalized = normalized
    .replace(/(\d+(?:\.\d+)?\s*GHz).*?(Intel\s+Core\s+i[3579])/i, '$2 $1')
    .replace(/(\d+(?:\.\d+)?\s*GHz).*?(i[3579])/i, 'Intel Core $2 $1')
    .replace(/(\d+(?:\.\d+)?\s*GHz).*?(core_i[3579])/i, 'Intel Core i$2 $1')
    .replace(/(\d+(?:\.\d+)?\s*GHz).*?(Celeron)/i, 'Intel Celeron $1')
    .replace(/(\d+(?:\.\d+)?\s*GHz).*?(Pentium)/i, 'Intel Pentium $1')
    .replace(/(Celeron).*?(\d+(?:\.\d+)?\s*GHz)/i, 'Intel Celeron $2')
    .replace(/(Pentium).*?(\d+(?:\.\d+)?\s*GHz)/i, 'Intel Pentium $2');
    
  // Make sure spaces are normalized
  normalized = normalized.replace(/\s+/g, ' ').trim();
    
  return normalized;
};

/**
 * Get a simplified version of the processor for filtering purposes
 */
export const getProcessorFilterValue = (processor: string): string => {
  const normalized = normalizeProcessor(processor).toLowerCase();
  
  // Intel Core Ultra
  if (normalized.includes('core ultra 9') || normalized.match(/ultra\s+9/)) {
    return 'Intel Core Ultra 9';
  }
  if (normalized.includes('core ultra 7') || normalized.match(/ultra\s+7/)) {
    return 'Intel Core Ultra 7';
  }
  if (normalized.includes('core ultra 5') || normalized.match(/ultra\s+5/)) {
    return 'Intel Core Ultra 5';
  }
  if (normalized.includes('core ultra') || normalized.includes('ultra')) {
    return 'Intel Core Ultra';
  }
  
  // Apple
  if (normalized.includes('m4 ultra')) return 'Apple M4 Ultra';
  if (normalized.includes('m4 max')) return 'Apple M4 Max';
  if (normalized.includes('m4 pro')) return 'Apple M4 Pro';
  if (normalized.includes('m4')) return 'Apple M4';
  
  if (normalized.includes('m3 ultra')) return 'Apple M3 Ultra';
  if (normalized.includes('m3 max')) return 'Apple M3 Max';
  if (normalized.includes('m3 pro')) return 'Apple M3 Pro';
  if (normalized.includes('m3')) return 'Apple M3';
  
  if (normalized.includes('m2 ultra')) return 'Apple M2 Ultra';
  if (normalized.includes('m2 max')) return 'Apple M2 Max';
  if (normalized.includes('m2 pro')) return 'Apple M2 Pro';
  if (normalized.includes('m2')) return 'Apple M2';
  
  if (normalized.includes('m1 ultra')) return 'Apple M1 Ultra';
  if (normalized.includes('m1 max')) return 'Apple M1 Max';
  if (normalized.includes('m1 pro')) return 'Apple M1 Pro';
  if (normalized.includes('m1')) return 'Apple M1';
  
  // Check for core_i patterns
  if (normalized.match(/core_i9/)) return 'Intel Core i9';
  if (normalized.match(/core_i7/)) return 'Intel Core i7';
  if (normalized.match(/core_i5/)) return 'Intel Core i5';
  if (normalized.match(/core_i3/)) return 'Intel Core i3';
  
  // Intel Core with generation info
  if (normalized.match(/13th|14th|i[3579]-13|i[3579]-14/)) {
    if (normalized.includes('i9')) return 'Intel Core i9 (13th/14th Gen)';
    if (normalized.includes('i7')) return 'Intel Core i7 (13th/14th Gen)';
    if (normalized.includes('i5')) return 'Intel Core i5 (13th/14th Gen)';
    if (normalized.includes('i3')) return 'Intel Core i3 (13th/14th Gen)';
  }
  
  if (normalized.match(/11th|12th|i[3579]-11|i[3579]-12/)) {
    if (normalized.includes('i9')) return 'Intel Core i9 (11th/12th Gen)';
    if (normalized.includes('i7')) return 'Intel Core i7 (11th/12th Gen)';
    if (normalized.includes('i5')) return 'Intel Core i5 (11th/12th Gen)';
    if (normalized.includes('i3')) return 'Intel Core i3 (11th/12th Gen)';
  }
  
  if (normalized.match(/10th|i[3579]-10/)) {
    if (normalized.includes('i9')) return 'Intel Core i9 (10th Gen)';
    if (normalized.includes('i7')) return 'Intel Core i7 (10th Gen)';
    if (normalized.includes('i5')) return 'Intel Core i5 (10th Gen)';
    if (normalized.includes('i3')) return 'Intel Core i3 (10th Gen)';
  }
  
  // GHz processor mentions
  if (normalized.match(/\d+(?:\.\d+)?\s*ghz.*i[3579]/) || normalized.match(/i[3579].*\d+(?:\.\d+)?\s*ghz/)) {
    if (normalized.includes('i9')) return 'Intel Core i9';
    if (normalized.includes('i7')) return 'Intel Core i7';
    if (normalized.includes('i5')) return 'Intel Core i5';
    if (normalized.includes('i3')) return 'Intel Core i3';
  }
  
  // GHz with Celeron or Pentium
  if (normalized.match(/\d+(?:\.\d+)?\s*ghz.*celeron/) || normalized.match(/celeron.*\d+(?:\.\d+)?\s*ghz/)) {
    return 'Intel Celeron';
  }
  if (normalized.match(/\d+(?:\.\d+)?\s*ghz.*pentium/) || normalized.match(/pentium.*\d+(?:\.\d+)?\s*ghz/)) {
    return 'Intel Pentium';
  }
  
  // Generic Intel Core
  if (normalized.includes('i9')) return 'Intel Core i9';
  if (normalized.includes('i7')) return 'Intel Core i7';
  if (normalized.includes('i5')) return 'Intel Core i5';
  if (normalized.includes('i3')) return 'Intel Core i3';
  
  // Budget Intel
  if (normalized.includes('celeron')) return 'Intel Celeron';
  if (normalized.includes('pentium')) return 'Intel Pentium';
  
  // AMD Ryzen (including underscore format)
  if (normalized.includes('ryzen 9') || normalized.includes('ryzen_9') || 
      normalized.match(/ryzen[_\s-]9[_\s-]\d{4}/)) return 'AMD Ryzen 9';
  if (normalized.includes('ryzen 7') || normalized.includes('ryzen_7') || 
      normalized.match(/ryzen[_\s-]7[_\s-]\d{4}/)) return 'AMD Ryzen 7';
  if (normalized.includes('ryzen 5') || normalized.includes('ryzen_5') || 
      normalized.match(/ryzen[_\s-]5[_\s-]\d{4}/)) return 'AMD Ryzen 5';
  if (normalized.includes('ryzen 3') || normalized.includes('ryzen_3') || 
      normalized.match(/ryzen[_\s-]3[_\s-]\d{4}/)) return 'AMD Ryzen 3';
  
  // Mobile
  if (normalized.includes('snapdragon')) return 'Qualcomm Snapdragon';
  if (normalized.includes('mediatek')) return 'MediaTek';
  
  return 'Other Processor';
};
