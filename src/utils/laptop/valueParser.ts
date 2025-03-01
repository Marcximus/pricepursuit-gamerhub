/**
 * Gets RAM value in GB from a string
 * More strictly validates RAM format to avoid confusion with storage
 */
export const getRamValue = (ram: string): number => {
  if (!ram) return 0;
  
  // Skip parsing if it's definitely not a RAM string
  // This helps distinguish RAM from storage/GPU memory
  if (ram.toLowerCase().includes('ssd') || 
      ram.toLowerCase().includes('hdd') || 
      ram.toLowerCase().includes('storage') ||
      ram.toLowerCase().includes('emmc') ||
      ram.toLowerCase().includes('vram') ||
      ram.toLowerCase().includes('graphics memory')) {
    return 0;
  }
  
  // Prioritize RAM patterns with RAM keywords
  const ramPatterns = [
    // RAM with DDR type (highest priority)
    /(\d+(\.\d+)?)\s*GB\s*(DDR\d*|LPDDR\d*)/i,
    
    // Explicit RAM or Memory mention
    /(\d+(\.\d+)?)\s*GB\s*(RAM|Memory)/i,
    /(\d+(\.\d+)?)\s*GB\s*of\s*(RAM|Memory)/i,
    
    // RAM/Memory mentioned first
    /(RAM|Memory|System Memory)\s*:\s*(\d+(\.\d+)?)\s*GB/i,
    
    // Generic GB pattern (lowest priority, only use if nothing else matches)
    /(\d+(\.\d+)?)\s*GB/i
  ];
  
  // Try patterns in order of priority
  for (const pattern of ramPatterns) {
    const match = ram.match(pattern);
    
    if (match) {
      // Extract the numeric value
      // For patterns where the numeric group is the first capture group
      let numValue: number;
      
      if (pattern.source.startsWith('(RAM|Memory|System')) {
        // For patterns where number is in second capture group
        numValue = parseFloat(match[2]);
      } else {
        // For patterns where number is in first capture group
        numValue = parseFloat(match[1]);
      }
      
      // Validate RAM values to be realistic for laptops
      // Typical laptop RAM: 4GB to 64GB, rarely 128GB
      // If it's outside this range, it might not be RAM
      if (numValue < 2 || numValue > 128) {
        continue; // Try next pattern
      }
      
      // If we're using the generic pattern (last one), do extra validation
      if (pattern === ramPatterns[ramPatterns.length - 1]) {
        // For generic GB patterns, we should check for common RAM sizes
        // to avoid confusion with storage
        const commonRamSizes = [4, 8, 12, 16, 24, 32, 64, 96, 128];
        const isCommonSize = commonRamSizes.some(size => 
          Math.abs(numValue - size) < 0.5 // Allow for small rounding differences
        );
        
        if (!isCommonSize) {
          continue; // Skip this match if it's not a common RAM size
        }
      }
      
      return numValue;
    }
  }
  
  // Try one more fallback for MB values (rare in modern laptops)
  const mbMatch = ram.match(/(\d+)\s*MB/i);
  if (mbMatch) {
    const mbValue = parseFloat(mbMatch[1]);
    return mbValue / 1024; // Convert to GB
  }
  
  return 0;
};

/**
 * Gets storage value in GB from a string
 * More strictly validates storage format to avoid confusion with RAM
 */
export const getStorageValue = (storage: string): number => {
  if (!storage) return 0;
  
  // Skip parsing if it doesn't look like storage
  if (!storage.toLowerCase().includes('gb') && 
      !storage.toLowerCase().includes('tb') && 
      !storage.toLowerCase().includes('ssd') && 
      !storage.toLowerCase().includes('hdd') && 
      !storage.toLowerCase().includes('storage') &&
      !storage.toLowerCase().includes('emmc')) {
    return 0;
  }
  
  // Extract numeric value
  const match = storage.match(/(\d+(\.\d+)?)\s*(GB|TB|MB)/i);
  if (!match) return 0;
  
  const [, value, , unit] = match;
  const numValue = parseFloat(value);
  
  // Validate storage values to be realistic for modern laptops
  // Typical laptop storage: 128GB to 2TB
  // If it's much lower than 128GB as SSD/HDD, it's probably not storage
  if (unit.toLowerCase() === 'gb' && numValue < 32) {
    return 0;
  }
  
  switch (unit.toLowerCase()) {
    case 'tb':
      return numValue * 1024;
    case 'mb':
      // Storage isn't typically measured in MB for modern laptops
      // If it is, it's probably an error, but we'll convert anyway
      return Math.round(numValue / 1024);
    case 'gb':
      return numValue;
    default:
      return 0;
  }
};

/**
 * Gets screen size value in inches from a string
 * Validates that the screen size is within a realistic range for laptops
 */
export const getScreenSizeValue = (size: string): number => {
  if (!size) return 0;
  
  const match = size.match(/(\d+\.?\d*)/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  
  // Validate screen size to be realistic for laptops (10" to 21")
  if (value < 10 || value > 21) {
    return 0;
  }
  
  return value;
};

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
