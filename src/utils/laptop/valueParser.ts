
/**
 * Gets RAM value in GB from a string
 * More strictly validates RAM format to avoid confusion with storage
 */
export const getRamValue = (ram: string): number => {
  // Skip parsing if it's not a RAM string
  if (!ram.toLowerCase().includes('gb') && !ram.toLowerCase().includes('ram')) {
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
  // Skip parsing if it doesn't look like storage
  if (!storage.toLowerCase().includes('gb') && 
      !storage.toLowerCase().includes('tb') && 
      !storage.toLowerCase().includes('ssd') && 
      !storage.toLowerCase().includes('hdd') && 
      !storage.toLowerCase().includes('storage')) {
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
  const match = size.match(/(\d+\.?\d*)/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  
  // Validate screen size to be realistic for laptops (10" to 21")
  if (value < 10 || value > 21) {
    return 0;
  }
  
  return value;
};
