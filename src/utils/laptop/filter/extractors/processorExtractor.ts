
import { normalizeProcessor } from "@/utils/laptop/normalizers/processorNormalizer";

/**
 * Extracts processor information from a laptop title
 * with fallback to the stored processor value
 */
export const extractProcessorFromTitle = (
  title: string | undefined,
  storedProcessor: string | null | undefined
): string | undefined => {
  if (!title) {
    return storedProcessor || undefined;
  }
  
  // Common processor patterns to look for in titles
  const processorPatterns = [
    // Apple processors - including M4
    /\b(?:Apple\s*)?M[1234]\s*(?:Pro|Max|Ultra)?\s*(?:chip)?\b/i,
    
    // Intel Core processors with generation and model
    /\b(?:Intel\s*)?Core\s*i[3579](?:[- ]\d{4,5}[A-Z]*)?(?:\s*\d{1,2}th\s*Gen)?\b/i,
    /\b(?:\d{1,2})th\s*Gen\s*(?:Intel\s*)?Core\s*i[3579]\b/i,
    
    // Intel Core Ultra
    /\b(?:Intel\s*)?Core\s*Ultra\s*[579]\b/i,
    
    // AMD Ryzen processors
    /\b(?:AMD\s*)?Ryzen\s*[3579](?:[- ]\d{4,5}[A-Z]*)?(?:\s*\d{1,2}th\s*Gen)?\b/i,
    
    // More generic processor matches
    /\b(?:Intel|AMD|Qualcomm|MediaTek)\s+[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+){1,3}\b/i,
    
    // Celeron, Pentium - also match with GHz speeds
    /\b(?:\d+(?:\.\d+)?\s*GHz\s*)?(?:Intel\s*)?(?:Celeron|Pentium)(?:\s*[A-Za-z0-9]+)?\b/i,
    
    // Snapdragon
    /\b(?:Snapdragon|Qualcomm)\s*\d+[A-Z]*\b/i,
  ];
  
  // Try to match processor from title
  for (const pattern of processorPatterns) {
    const match = title.match(pattern);
    if (match && match[0]) {
      // Clean and normalize the extracted processor
      return normalizeProcessor(match[0]);
    }
  }
  
  // Fall back to stored processor if we couldn't extract from title
  return storedProcessor || undefined;
};

/**
 * Groups processors into standardized categories for filtering
 */
export const standardizeProcessorForFiltering = (processor: string | null | undefined): string => {
  if (!processor) return 'Unknown';
  
  const normalizedProcessor = normalizeProcessor(processor).toLowerCase();
  
  // Standardized processor categories
  
  // Apple Silicon - added M4
  if (normalizedProcessor.includes('m4 ultra')) return 'Apple M4 Ultra';
  if (normalizedProcessor.includes('m4 max')) return 'Apple M4 Max';
  if (normalizedProcessor.includes('m4 pro')) return 'Apple M4 Pro';
  if (normalizedProcessor.includes('m4')) return 'Apple M4';
  
  if (normalizedProcessor.includes('m3 ultra')) return 'Apple M3 Ultra';
  if (normalizedProcessor.includes('m3 max')) return 'Apple M3 Max';
  if (normalizedProcessor.includes('m3 pro')) return 'Apple M3 Pro';
  if (normalizedProcessor.includes('m3')) return 'Apple M3';
  
  if (normalizedProcessor.includes('m2 ultra')) return 'Apple M2 Ultra';
  if (normalizedProcessor.includes('m2 max')) return 'Apple M2 Max';
  if (normalizedProcessor.includes('m2 pro')) return 'Apple M2 Pro';
  if (normalizedProcessor.includes('m2')) return 'Apple M2';
  
  if (normalizedProcessor.includes('m1 ultra')) return 'Apple M1 Ultra';
  if (normalizedProcessor.includes('m1 max')) return 'Apple M1 Max';
  if (normalizedProcessor.includes('m1 pro')) return 'Apple M1 Pro';
  if (normalizedProcessor.includes('m1')) return 'Apple M1';
  
  // Intel Core Ultra - new generation
  if (normalizedProcessor.includes('core ultra 9')) return 'Intel Core Ultra 9';
  if (normalizedProcessor.includes('core ultra 7')) return 'Intel Core Ultra 7';
  if (normalizedProcessor.includes('core ultra 5')) return 'Intel Core Ultra 5';
  if (normalizedProcessor.includes('core ultra')) return 'Intel Core Ultra';
  
  // Intel Core - by generation and series
  if (normalizedProcessor.includes('13th gen') || normalizedProcessor.includes('14th gen')) {
    if (normalizedProcessor.includes('i9')) return 'Intel Core i9 (13th/14th Gen)';
    if (normalizedProcessor.includes('i7')) return 'Intel Core i7 (13th/14th Gen)';
    if (normalizedProcessor.includes('i5')) return 'Intel Core i5 (13th/14th Gen)';
    if (normalizedProcessor.includes('i3')) return 'Intel Core i3 (13th/14th Gen)';
  }
  
  if (normalizedProcessor.includes('11th gen') || normalizedProcessor.includes('12th gen')) {
    if (normalizedProcessor.includes('i9')) return 'Intel Core i9 (11th/12th Gen)';
    if (normalizedProcessor.includes('i7')) return 'Intel Core i7 (11th/12th Gen)';
    if (normalizedProcessor.includes('i5')) return 'Intel Core i5 (11th/12th Gen)';
    if (normalizedProcessor.includes('i3')) return 'Intel Core i3 (11th/12th Gen)';
  }
  
  if (normalizedProcessor.includes('10th gen') || normalizedProcessor.match(/i[3579]-10\d{3}/)) {
    if (normalizedProcessor.includes('i9')) return 'Intel Core i9 (10th Gen)';
    if (normalizedProcessor.includes('i7')) return 'Intel Core i7 (10th Gen)';
    if (normalizedProcessor.includes('i5')) return 'Intel Core i5 (10th Gen)';
    if (normalizedProcessor.includes('i3')) return 'Intel Core i3 (10th Gen)';
  }
  
  // AMD Ryzen
  if (normalizedProcessor.includes('ryzen 9')) return 'AMD Ryzen 9';
  if (normalizedProcessor.includes('ryzen 7')) return 'AMD Ryzen 7';
  if (normalizedProcessor.includes('ryzen 5')) return 'AMD Ryzen 5';
  if (normalizedProcessor.includes('ryzen 3')) return 'AMD Ryzen 3';
  
  // Generic Intel Core
  if (normalizedProcessor.includes('i9')) return 'Intel Core i9';
  if (normalizedProcessor.includes('i7')) return 'Intel Core i7';
  if (normalizedProcessor.includes('i5')) return 'Intel Core i5';
  if (normalizedProcessor.includes('i3')) return 'Intel Core i3';
  
  // Budget Intel - match more loosely to catch variants
  if (normalizedProcessor.includes('celeron')) return 'Intel Celeron';
  if (normalizedProcessor.includes('pentium')) return 'Intel Pentium';
  
  // Qualcomm
  if (normalizedProcessor.includes('snapdragon')) return 'Qualcomm Snapdragon';
  
  // MediaTek
  if (normalizedProcessor.includes('mediatek')) return 'MediaTek';
  
  // Default category for anything else
  return 'Other Processor';
};
