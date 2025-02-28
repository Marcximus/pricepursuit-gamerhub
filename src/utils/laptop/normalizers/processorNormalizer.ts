
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
    
  // Standardize Intel naming
  normalized = normalized
    .replace(/intel\s+core\s+i([3579])[- ](\d{4,5})(H|U|HQ|K)?/i, 'Intel Core i$1-$2$3')
    .replace(/intel\s+core\s+i([3579])[- ](\d{1,2}th)\s+gen/i, 'Intel Core i$1 $2 Gen')
    .replace(/intel\s+core\s+i([3579])/i, 'Intel Core i$1')
    .replace(/\bi([3579])[- ](\d{4,5})(H|U|HQ|K)?/i, 'Intel Core i$1-$2$3')
    .replace(/\bi([3579])\b/i, 'Intel Core i$1')
    .replace(/intel\s+celeron/i, 'Intel Celeron')
    .replace(/intel\s+pentium/i, 'Intel Pentium')
    .replace(/intel\s+ultra\s+([579])/i, 'Intel Core Ultra $1');
    
  // Standardize AMD naming
  normalized = normalized
    .replace(/amd\s+ryzen\s+([3579])[- ](\d{4,5}[A-Z]*(?:\s*HX)?)/i, 'AMD Ryzen $1-$2')
    .replace(/amd\s+ryzen\s+([3579])/i, 'AMD Ryzen $1')
    .replace(/ryzen\s+([3579])[- ](\d{4,5}[A-Z]*(?:\s*HX)?)/i, 'AMD Ryzen $1-$2')
    .replace(/ryzen\s+([3579])/i, 'AMD Ryzen $1');
    
  // Apple naming
  normalized = normalized
    .replace(/apple\s+m(\d)(\s+(pro|max|ultra))?(\s+chip)?/i, 'Apple M$1$2 chip')
    .replace(/m(\d)(\s+(pro|max|ultra))?(\s+chip)?/i, 'Apple M$1$2 chip')
    // Make sure "chip" is always added for Apple processors
    .replace(/apple\s+m(\d)(\s+(pro|max|ultra))?$/i, 'Apple M$1$2 chip');
    
  // Make sure spaces are normalized
  normalized = normalized.replace(/\s+/g, ' ').trim();
    
  return normalized;
};

/**
 * Get a simplified version of the processor for filtering purposes
 */
export const getProcessorFilterValue = (processor: string): string => {
  const normalized = normalizeProcessor(processor).toLowerCase();
  
  // Intel CPU categories
  if (normalized.includes('intel core ultra')) return 'Intel Core Ultra';
  if (normalized.includes('i9')) return 'Intel Core i9';
  if (normalized.includes('i7')) return 'Intel Core i7';
  if (normalized.includes('i5')) return 'Intel Core i5';
  if (normalized.includes('i3')) return 'Intel Core i3';
  if (normalized.includes('celeron')) return 'Intel Celeron';
  if (normalized.includes('pentium')) return 'Intel Pentium';
  
  // AMD CPU categories
  if (normalized.includes('ryzen 9')) return 'AMD Ryzen 9';
  if (normalized.includes('ryzen 7')) return 'AMD Ryzen 7';
  if (normalized.includes('ryzen 5')) return 'AMD Ryzen 5';
  if (normalized.includes('ryzen 3')) return 'AMD Ryzen 3';
  
  // Apple CPU categories
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
  
  return normalized;
};
