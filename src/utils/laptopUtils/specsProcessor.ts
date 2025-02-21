export const processProcessor = (processor: string | undefined, title: string): string | undefined => {
  if (processor && typeof processor === 'string' && !processor.includes('undefined')) {
    return processor;
  }
  
  // Look for processor in the title (more specific patterns first)
  const processorPatterns = [
    // Match full processor names with generation and model
    /\b(?:Intel Core i[3579]|AMD Ryzen [3579]|Intel Celeron|Intel Pentium|MediaTek|Apple M[12])\s*(?:[A-Z0-9-]+(?:\s*[A-Z0-9]+)*(?:\s*HX)?)\b/i,
    // Match processor names with generation numbers
    /\b(?:i[3579]-\d{4,5}[A-Z]*(?:\s*HX)?|Ryzen\s*\d\s*\d{4}[A-Z]*(?:\s*HX)?)\b/i,
    // Match processor with core count and generation
    /\b(?:\d{1,2}-Core\s+i[3579](?:-\d{4,5}[A-Z]*)?)\b/i,
    // Match any Intel or AMD processor pattern
    /\b(?:Intel|AMD)\s+(?:Core\s+)?(?:[A-Za-z]+(?:\s+[A-Za-z]+)*\s+)?(?:[0-9]+[A-Z]*(?:-[0-9]+[A-Z]*)?)\b/i,
  ];
  
  for (const pattern of processorPatterns) {
    const match = title.match(pattern);
    if (match) {
      // Clean up and standardize processor name
      let processedName = match[0].trim()
        .replace(/\s+/g, ' ')  // Normalize spaces
        .replace(/intel core/i, 'Intel Core')
        .replace(/amd ryzen/i, 'AMD Ryzen')
        .replace(/\bi(\d)/i, 'Intel Core i$1');  // Expand i5 to Intel Core i5
      
      // Remove duplicate "Intel Core" if present
      processedName = processedName.replace(/(Intel Core)\s+Intel Core/i, '$1');
      
      // Add "Intel Core" prefix if it's just an i-series number
      if (/^i[3579]/i.test(processedName)) {
        processedName = `Intel Core ${processedName}`;
      }
      
      return processedName;
    }
  }
  
  return undefined;
};

export const processRam = (ram: string | undefined, title: string): string | undefined => {
  if (ram && typeof ram === 'string' && !ram.includes('undefined')) {
    return ram;
  }
  
  // Look for RAM in the title (more specific patterns first)
  const ramPatterns = [
    // Match RAM with DDR type
    /\b(\d+)\s*GB\s*(?:DDR[345]|LPDDR[345])\b/i,
    // Match generic RAM mentions
    /\b(\d+)\s*GB\s*RAM\b/i,
    // Match RAM before storage or other specs
    /\b(\d+)\s*GB\b(?=.*(?:SSD|HDD|Storage|RAM))/i,
    // Match RAM anywhere if followed by storage size
    /\b(\d+)\s*GB\b(?=.*\d+\s*GB)/i,
  ];
  
  for (const pattern of ramPatterns) {
    const match = title.match(pattern);
    if (match) {
      const ramSize = match[1];
      // Look for DDR type
      const ddrMatch = title.match(/\b(DDR[345]|LPDDR[345])\b/i);
      return ddrMatch ? `${ramSize}GB ${ddrMatch[0].toUpperCase()}` : `${ramSize}GB`;
    }
  }
  
  return undefined;
};

export const processStorage = (storage: string | undefined, title: string): string | undefined => {
  if (storage && typeof storage === 'string' && !storage.includes('undefined')) {
    return storage;
  }
  
  // Look for storage in the title (more specific patterns first)
  const storagePatterns = [
    // Match specific SSD types with size
    /\b(\d+)\s*(?:GB|TB)\s*(?:Gen ?[1-5]|PCIe|NVMe|M\.2)?\s*SSD\b/i,
    // Match SSD/HDD with size and optional type
    /\b(\d+)\s*(?:GB|TB)\s*(?:Solid State Drive|Hard Drive|SSD|HDD|eMMC|Storage)\b/i,
    // Match storage mentions with Gen/PCIe/NVMe specification
    /\b(?:Gen ?[1-5]|PCIe|NVMe|M\.2)?\s*(\d+)\s*(?:GB|TB)\s*(?:SSD|Storage)\b/i,
    // Generic storage pattern (use only if no other matches)
    /\b(\d+)\s*(?:GB|TB)\b(?!.*(?:RAM|Memory))/i, // Negative lookahead to avoid matching RAM
  ];
  
  for (const pattern of storagePatterns) {
    const match = title.match(pattern);
    if (match) {
      const size = match[1];
      const unit = match[0].includes('TB') ? 'TB' : 'GB';
      
      // Extract storage type information
      let type = 'SSD'; // Default to SSD
      let generation = '';
      
      const genMatch = title.match(/\bGen ?([1-5])\b/i);
      const typeMatch = title.match(/\b(?:PCIe|NVMe|M\.2)\b/i);
      
      if (genMatch) {
        generation = ` Gen ${genMatch[1]}`;
      }
      
      if (typeMatch) {
        type = `${typeMatch[0].toUpperCase()} ${type}`;
      }
      
      if (match[0].toLowerCase().includes('hdd')) {
        type = 'HDD';
      } else if (match[0].toLowerCase().includes('emmc')) {
        type = 'eMMC';
      }
      
      return `${size}${unit}${generation ? generation : ''} ${type}`.trim();
    }
  }
  
  return undefined;
};
