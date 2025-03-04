
/**
 * Functions for processing and normalizing storage information
 */

export const processStorage = (storage: string | undefined, title: string, description?: string): string | undefined => {
  if (storage && typeof storage === 'string' && !storage.includes('undefined')) {
    // Check for and correct obviously wrong TB values
    if (storage.match(/\b(256|512|128|1000|2000)\s*TB\b/i)) {
      console.warn(`Found likely incorrect TB value in storage: "${storage}"`);
      // Replace TB with GB for common laptop storage sizes
      const correctedStorage = storage.replace(/(\b(?:256|512|128|1000|2000))\s*TB\b/i, '$1 GB');
      console.log(`Corrected storage: "${storage}" → "${correctedStorage}"`);
      storage = correctedStorage;
    }
    
    // Clean up existing storage string
    const cleanedStorage = storage.trim().replace(/\s+/g, ' ');
    if (cleanedStorage.length > 4) {
      return cleanedStorage;
    }
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for storage in the text (more specific patterns first)
  const storagePatterns = [
    // Match explicit storage mentions with size and unit
    /\b(\d+)\s*(?:TB|GB)\s*(?:SSD|HDD|storage|flash|drive)\b/i,
    
    // Match numerical values followed by TB/GB near storage indicators
    /\b(\d+)\s*(?:TB|GB)\b(?=[^.]*?(?:storage|ssd|drive))/i,
    
    // Match storage in technical specs format
    /\bstorage:?\s*(\d+)\s*(?:TB|GB)\b/i,
    /\b(?:ssd|hdd|storage):?\s*(\d+)\s*(?:TB|GB)\b/i,
    
    // Match storage mentions in product title format (like 16GB / 1TB)
    /\b(?:\d+\s*GB\s*\/\s*)(\d+)\s*TB\b/i,
    /\b(?:\d+\s*GB\s*[\/,]\s*)(\d+)\s*GB\b/i,
    
    // Slashes often separate RAM and storage
    /\b\d+\s*GB\s*\/\s*(\d+)\s*(?:TB|GB)\b/i,
    
    // Match any TB/GB mention that doesn't look like RAM
    /\b(\d+)\s*TB\b(?!.*?RAM)/i,
    /\b(\d+)\s*GB\b(?!.*?(?:RAM|memory))/i,
  ];
  
  for (const pattern of storagePatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      const size = match[1];
      let unit = textToSearch.substring(match.index || 0, (match.index || 0) + match[0].length).toLowerCase().includes('tb') ? 'TB' : 'GB';
      
      // Validate storage size is reasonable for laptops
      const sizeNum = parseInt(size, 10);
      
      // Correct obvious errors (e.g., 512 TB should be 512 GB)
      let correctedUnit = unit;
      if (unit.toLowerCase() === 'tb' && sizeNum > 16) {
        // Auto-correct common laptop storage sizes that would be unrealistic as TB
        if (sizeNum === 128 || sizeNum === 256 || sizeNum === 512 || sizeNum === 1000 || sizeNum === 2000) {
          correctedUnit = 'GB';
          console.log(`Auto-corrected storage from ${sizeNum}TB to ${sizeNum}GB`);
        } else {
          continue; // Skip unrealistic storage values
        }
      }
      
      // Extract storage type information
      let type = 'SSD'; // Default to SSD for modern laptops
      
      if (textToSearch.toLowerCase().includes('hdd') || textToSearch.toLowerCase().includes('hard drive')) {
        type = 'HDD';
      } else if (textToSearch.toLowerCase().includes('emmc')) {
        type = 'eMMC';
      }
      
      // Add NVMe if mentioned
      if (textToSearch.toLowerCase().includes('nvme')) {
        type = 'NVMe ' + type;
      } else if (textToSearch.toLowerCase().includes('pcie')) {
        type = 'PCIe ' + type;
      }
      
      return `${size} ${correctedUnit} ${type}`.trim();
    }
  }
  
  // If no match found but we see "1TB" in title or description
  if (textToSearch.match(/\b1\s*TB\b/i)) {
    return "1 TB SSD";
  }
  
  // If no match found but we see common storage patterns like "512GB"
  const commonSizes = ["256GB", "512GB", "1TB", "2TB"];
  for (const size of commonSizes) {
    if (textToSearch.includes(size)) {
      return `${size.replace(/(GB|TB)$/i, " $1")} SSD`;
    }
  }
  
  return undefined;
};

// Helper function to validate storage values
export const isRealisticStorageValue = (storage: string): boolean => {
  if (!storage) return false;
  
  // Check for obviously wrong values like "512 TB" which should be "512 GB"
  if (storage.match(/\b(128|256|512|1000|2000)\s*TB\b/i)) {
    return false;
  }
  
  // Extract the numeric value and unit
  const match = storage.match(/(\d+)\s*(TB|GB)/i);
  if (!match) return true; // Can't validate without a match
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  // Typical laptop storage ranges
  if (unit === 'tb') {
    return value >= 1 && value <= 16; // 1TB to 16TB is reasonable
  } else if (unit === 'gb') {
    return value >= 128 && value <= 4000; // 128GB to 4000GB is reasonable
  }
  
  return true;
};
