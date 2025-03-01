
/**
 * Functions for processing and normalizing storage information
 */

export const processStorage = (storage: string | undefined, title: string, description?: string): string | undefined => {
  if (storage && typeof storage === 'string' && !storage.includes('undefined')) {
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
    
    // Generic storage pattern (use only if no other matches)
    /\b(\d+)\s*(?:GB|TB)\b(?!.*(?:RAM|Memory))/i, // Negative lookahead to avoid matching RAM
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
        
        return `${primarySize}${primaryUnit} ${primaryType} + ${secondarySize}${secondaryUnit} ${secondaryType}`;
      }
      
      // Process single storage
      const size = match[1];
      const unit = match[0].includes('TB') ? 'TB' : 'GB';
      
      // Extract storage type information
      let type = 'SSD'; // Default to SSD for modern laptops
      let generation = '';
      
      const genMatch = textToSearch.match(/\bGen ?([1-5])\b/i);
      const typeMatch = textToSearch.match(/\b(?:PCIe|NVMe|M\.2)\b/i);
      
      if (genMatch) {
        generation = ` Gen ${genMatch[1]}`;
      }
      
      if (typeMatch) {
        type = `${typeMatch[0].toUpperCase()} ${type}`;
      }
      
      if (match[0].toLowerCase().includes('hdd') || match[0].toLowerCase().includes('hard drive')) {
        type = 'HDD';
      } else if (match[0].toLowerCase().includes('emmc')) {
        type = 'eMMC';
      } else if (!typeMatch && !match[0].toLowerCase().includes('ssd')) {
        // If no explicit storage type is mentioned, check if we can infer it
        if (parseInt(size, 10) >= 500 && unit === 'GB') {
          // Modern laptops with ≥500GB storage are likely to have SSD
          type = 'SSD';
        } else if (unit === 'TB') {
          // TB-sized storage could be either, but more likely SSD in newer laptops
          type = 'SSD';
        }
      }
      
      // Validate storage size is reasonable
      const sizeNum = parseInt(size, 10);
      if ((unit === 'GB' && sizeNum < 16) || (unit === 'TB' && sizeNum > 8)) {
        continue; // Skip unrealistic storage values
      }
      
      return `${size}${unit}${generation ? generation : ''} ${type}`.trim();
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
      
      return `${storageSize}${storageUnit} ${storageType}`;
    }
  }
  
  return undefined;
};
