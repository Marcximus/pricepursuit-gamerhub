
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
    // Match specific SSD types with size
    /\b(\d+)\s*(?:GB|TB)\s*(?:Gen ?[1-5]|PCIe|NVMe|M\.2)?\s*SSD\b/i,
    
    // Match SSD with PCIE/NVME generation
    /\b(\d+)\s*(?:GB|TB)\s*(?:PCIe|NVMe)\s*(?:Gen ?[1-5])?\s*(?:x[24])?\s*(?:SSD|Storage)\b/i,
    
    // Match SSD/HDD with size and optional type
    /\b(\d+)\s*(?:GB|TB)\s*(?:Solid State Drive|Hard Drive|SSD|HDD|eMMC|Storage)\b/i,
    
    // Match storage keywords with sizes
    /\bStorage:?\s*(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|PCIe|NVMe|eMMC)?\b/i,
    /\b(?:SSD|HDD|Hard Drive):?\s*(\d+)\s*(?:GB|TB)\b/i,
    
    // Match storage mentions with Gen/PCIe/NVMe specification
    /\b(?:Gen ?[1-5]|PCIe|NVMe|M\.2)?\s*(\d+)\s*(?:GB|TB)\s*(?:SSD|Storage)\b/i,
    
    // Match general storage pattern after specific ones
    /\b(\d+)\s*(?:GB|TB)\s*(?:Storage|Drive)\b/i,
    
    // Match dual storage configurations
    /\b(\d+)\s*(?:GB|TB)\s*(?:SSD|PCIe|NVMe)\s*\+\s*(\d+)\s*(?:GB|TB)\s*(?:HDD|SSD)\b/i,
    
    // Generic storage pattern - this should catch "1TB SSD" in our example
    /\b(\d+)\s*(?:GB|TB)\b(?!.*(?:RAM|Memory))/i,
  ];
  
  for (const pattern of storagePatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      // Check for dual storage configuration
      if (pattern.source.includes('\\+') && match[2]) {
        const primarySize = match[1];
        const primaryUnit = textToSearch.substring(match.index, match.index + 50).includes('TB') ? 'TB' : 'GB';
        
        const secondarySize = match[2];
        const secondaryUnit = textToSearch.substring(match.index + match[0].indexOf('+'), match.index + 50).includes('TB') ? 'TB' : 'GB';
        
        const primaryType = textToSearch.substring(match.index, match.index + match[0].indexOf('+')).includes('SSD') ? 'SSD' : 'HDD';
        const secondaryType = textToSearch.substring(match.index + match[0].indexOf('+'), match.index + 50).includes('SSD') ? 'SSD' : 'HDD';
        
        // For standardized filtering, format as the larger of the two storage values
        const primarySizeNum = parseInt(primarySize, 10) * (primaryUnit === 'TB' ? 1024 : 1);
        const secondarySizeNum = parseInt(secondarySize, 10) * (secondaryUnit === 'TB' ? 1024 : 1);
        const totalStorageGB = primarySizeNum + secondarySizeNum;
        
        if (totalStorageGB >= 1024) {
          const tbSize = (totalStorageGB / 1024).toFixed(1);
          return `${primarySize}${primaryUnit} ${primaryType} + ${secondarySize}${secondaryUnit} ${secondaryType} (${tbSize}TB Total)`;
        }
        
        return `${primarySize}${primaryUnit} ${primaryType} + ${secondarySize}${secondaryUnit} ${secondaryType}`;
      }
      
      // Process single storage
      const size = match[1];
      let unit = match[0].toLowerCase().includes('tb') ? 'TB' : 'GB';
      
      // Validate storage values for realism
      // Common laptop SSD/HDD sizes are typically 128GB, 256GB, 512GB, 1TB, 2TB
      // Catching unrealistic values like 512TB when it should be 512GB
      const sizeNum = parseInt(size, 10);
      if (unit.toLowerCase() === 'tb' && sizeNum > 16) {
        console.warn(`Unrealistic TB storage value detected: ${sizeNum}TB. Likely a typo for GB.`);
        // Auto-correct common laptop storage sizes
        if (sizeNum === 128 || sizeNum === 256 || sizeNum === 512 || sizeNum === 1000 || sizeNum === 2000) {
          unit = 'GB';
          console.log(`Auto-corrected storage unit from TB to GB: ${sizeNum}${unit}`);
        } else {
          // Skip this match if it's unrealistic and we couldn't auto-correct it
          continue;
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
      
      // Validate storage size is reasonable for laptops
      // Common sizes: 128GB, 256GB, 512GB, 1TB, 2TB
      const normalizedSizeGB = unit.toLowerCase() === 'tb' ? sizeNum * 1024 : sizeNum;
      
      if (normalizedSizeGB < 32 || normalizedSizeGB > 16384) { // 32GB to 16TB range
        console.warn(`Storage value outside reasonable range: ${size}${unit} (${normalizedSizeGB}GB)`);
        continue; // Skip unrealistic storage values
      }
      
      return `${size}${unit} ${type}`.trim();
    }
  }
  
  // Advanced fallback: look for storage specifications in description
  if (description) {
    const descStorageMatch = description.match(/\b(?:storage|ssd|hard drive|hdd)[:\s]+(\d+)\s*(?:GB|TB)\b/i);
    if (descStorageMatch) {
      const storageSize = descStorageMatch[1];
      const storageUnit = descStorageMatch[0].toLowerCase().includes('tb') ? 'TB' : 'GB';
      
      // Detect storage type
      let storageType = 'SSD'; // Default to SSD for modern laptops
      if (descStorageMatch[0].toLowerCase().includes('hdd') || 
          descStorageMatch[0].toLowerCase().includes('hard drive')) {
        storageType = 'HDD';
      }
      
      // Validate storage size
      const sizeNum = parseInt(storageSize, 10);
      
      // Correct obvious errors (e.g., 512 TB should be 512 GB)
      let correctedUnit = storageUnit;
      if (storageUnit.toLowerCase() === 'tb' && sizeNum > 16) {
        // Auto-correct common laptop storage sizes that would be unrealistic as TB
        if (sizeNum === 128 || sizeNum === 256 || sizeNum === 512 || sizeNum === 1000 || sizeNum === 2000) {
          correctedUnit = 'GB';
          console.log(`Auto-corrected description storage from ${sizeNum}TB to ${sizeNum}GB`);
        } else {
          return undefined; // Skip unrealistic storage values
        }
      }
      
      return `${storageSize}${correctedUnit} ${storageType}`;
    }
  }
  
  return undefined;
};
