
/**
 * Gets RAM value in GB from a string
 * More strictly validates RAM format to avoid confusion with storage
 */
export const getRamValue = (ram: string): number => {
  if (!ram) return 0;
  
  // Skip parsing if it's not a RAM string
  if (!ram.toLowerCase().includes('gb') && 
      !ram.toLowerCase().includes('ram') && 
      !ram.toLowerCase().includes('memory') &&
      !ram.toLowerCase().includes('ddr')) {
    return 0;
  }
  
  // Extract numeric value
  const match = ram.match(/(\d+(\.\d+)?)\s*(GB|TB|MB)/i);
  if (!match) return 0;
  
  const [, value, , unit] = match;
  const numValue = parseFloat(value);
  
  // Validate RAM values to be realistic for laptops
  // Typical laptop RAM: 4GB to 64GB, very rarely 128GB
  // If it's outside this range, it's probably not RAM
  if (unit.toLowerCase() === 'gb' && (numValue < 2 || numValue > 128)) {
    return 0;
  }
  
  // If it's TB, it's definitely not RAM (convert but flag as suspicious)
  if (unit.toLowerCase() === 'tb' && numValue > 0) {
    const gbValue = numValue * 1024;
    // If converting to GB gives an unrealistic value, reject it
    return gbValue > 128 ? 0 : gbValue;
  }
  
  switch (unit.toLowerCase()) {
    case 'tb':
      return numValue * 1024;
    case 'mb':
      return Math.round((numValue / 1024) * 10) / 10; // Round to 1 decimal place
    case 'gb':
      return numValue;
    default:
      return 0;
  }
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
