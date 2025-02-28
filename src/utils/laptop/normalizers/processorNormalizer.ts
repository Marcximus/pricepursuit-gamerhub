
import { getProcessorValue } from '../hardwareScoring';

/**
 * Normalizes processor strings for consistent display
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
    .replace(/intel\s+core\s+i([3579])/i, 'Intel Core i$1');
    
  // Standardize AMD naming
  normalized = normalized
    .replace(/amd\s+ryzen\s+([3579])[- ](\d{4,5}[A-Z]*(?:\s*HX)?)/i, 'AMD Ryzen $1-$2')
    .replace(/amd\s+ryzen\s+([3579])/i, 'AMD Ryzen $1');
    
  // Apple naming
  normalized = normalized
    .replace(/apple\s+m1(\s+pro|\s+max)?/i, 'Apple M1$1')
    .replace(/apple\s+m2(\s+pro|\s+max)?/i, 'Apple M2$1')
    .replace(/apple\s+m3(\s+pro|\s+max)?/i, 'Apple M3$1')
    .replace(/m1(\s+pro|\s+max)?/i, 'Apple M1$1')
    .replace(/m2(\s+pro|\s+max)?/i, 'Apple M2$1')
    .replace(/m3(\s+pro|\s+max)?/i, 'Apple M3$1');
    
  return normalized;
};
