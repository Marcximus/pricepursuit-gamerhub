
export const processProcessor = (processor: string | undefined, title: string): string | undefined => {
  if (processor && typeof processor === 'string' && !processor.includes('undefined')) {
    return processor;
  }
  
  // Look for processor in the title (more specific patterns first)
  const processorPatterns = [
    /\b(?:Intel Core i[3579]|AMD Ryzen [3579]|Intel Celeron|Intel Pentium|MediaTek|Apple M[12])\s*(?:[A-Z0-9-]+)?\b/i,
    /\b(?:i[3579]-\d{4,5}[A-Z]*|Ryzen\s*\d\s*\d{4}[A-Z]*)\b/i,
    /\b(?:Intel|AMD)\s+(?:Core\s+)?(?:[A-Za-z]+(?:\s+[A-Za-z]+)*\s+)?(?:[0-9]+[A-Z]*(?:-[0-9]+[A-Z]*)?)\b/i,
  ];
  
  for (const pattern of processorPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0].trim();
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
    /\b(\d+)\s*GB\s*(?:DDR[34]|LPDDR[345]|RAM)\b/i,
    /\b(\d+)\s*GB\b/i,
    /\bRAM\s*(\d+)\s*GB\b/i,
  ];
  
  for (const pattern of ramPatterns) {
    const match = title.match(pattern);
    if (match) {
      return `${match[1]}GB`;
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
    /\b(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|eMMC|PCIe|NVMe|Storage)\b/i,
    /\b(?:SSD|HDD|Storage)\s*(\d+)\s*(?:GB|TB)\b/i,
    /\b(\d+)\s*(?:GB|TB)\b/i,
  ];
  
  for (const pattern of storagePatterns) {
    const match = title.match(pattern);
    if (match) {
      const size = match[1];
      const unit = match[0].includes('TB') ? 'TB' : 'GB';
      const type = match[0].match(/(?:SSD|HDD|eMMC|PCIe|NVMe)/i)?.[0] || 'SSD';
      return `${size}${unit} ${type}`;
    }
  }
  
  return undefined;
};

