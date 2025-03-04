
/**
 * Parser utility for storage values
 */

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
  
  // First, check for common incorrect values (512 TB SSD when it should be 512 GB SSD)
  // Common laptop storage sizes that are likely typos if listed as TB
  const commonSizesPattern = /\b(128|256|512|1000|2000)\s*TB\b/i;
  if (commonSizesPattern.test(storage)) {
    console.warn(`Likely incorrect TB value detected in storage: "${storage}"`);
    // Auto-correct by treating it as GB instead
    const match = storage.match(/(\d+)(\.\d+)?\s*TB/i);
    if (match) {
      const value = parseFloat(match[1]);
      console.log(`Auto-correcting unrealistic storage: ${value} TB → ${value} GB`);
      return value; // Treat as GB directly (not multiplying by 1024)
    }
  }
  
  // Extract numeric value
  const match = storage.match(/(\d+(\.\d+)?)\s*(GB|TB|MB)/i);
  if (!match) return 0;
  
  const [, value, , unit] = match;
  const numValue = parseFloat(value);
  
  // Additional validation for unrealistic values
  if (unit.toLowerCase() === 'tb' && numValue > 16) {
    console.warn(`Unrealistic TB value: ${numValue}TB in "${storage}". Likely a GB typo.`);
    
    // For common laptop storage values that are impossible as TB, 
    // automatically correct by treating as GB
    if ([128, 256, 512, 1000, 2048].includes(numValue) || 
        (numValue > 100 && numValue < 1000)) {
      console.log(`Auto-correcting storage unit: ${numValue}TB → ${numValue}GB`);
      return numValue; // Return as GB instead of TB
    }
    
    return 0; // Invalid value
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
