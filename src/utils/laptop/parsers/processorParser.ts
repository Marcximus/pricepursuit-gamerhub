
/**
 * Parser utility for processor values
 */

/**
 * Gets core count from a processor description
 */
export const getCoreCount = (processor: string): number => {
  if (!processor) return 0;
  
  // Look for explicit core count mentions
  const coreMatch = processor.match(/(\d+)[\s-]core/i);
  if (coreMatch) {
    return parseInt(coreMatch[1]);
  }
  
  // Estimate based on processor type
  const normalized = processor.toLowerCase();
  
  // Apple silicon
  if (normalized.includes('m1 ultra') || normalized.includes('m2 ultra')) return 20;
  if (normalized.includes('m1 max') || normalized.includes('m2 max')) return 10;
  if (normalized.includes('m1 pro') || normalized.includes('m2 pro')) return 8;
  if (normalized.includes('m1') || normalized.includes('m2')) return 4;
  if (normalized.includes('m3 ultra')) return 24;
  if (normalized.includes('m3 max')) return 14;
  if (normalized.includes('m3 pro')) return 12;
  if (normalized.includes('m3')) return 8;
  
  // Intel
  if (normalized.includes('i9')) return 14;
  if (normalized.includes('i7')) return 10;
  if (normalized.includes('i5')) return 6;
  if (normalized.includes('i3')) return 4;
  
  // AMD
  if (normalized.includes('ryzen 9')) return 12;
  if (normalized.includes('ryzen 7')) return 8;
  if (normalized.includes('ryzen 5')) return 6;
  if (normalized.includes('ryzen 3')) return 4;
  
  return 0;
};
