
export const processProcessor = (processor: string | undefined, title: string): string | undefined => {
  if (processor && typeof processor === 'string' && !processor.includes('undefined')) {
    return processor;
  }
  
  const processorPatterns = [
    /\b(Intel Core i[3579]|AMD Ryzen [3579]|Intel Celeron|Intel Pentium|MediaTek|Apple M[12])\s*[\w-]*\b/i,
    /\b(i[3579]-\d{4,5}[A-Z]*|Ryzen\s*\d\s*\d{4}[A-Z]*)\b/i
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
  
  const ramPattern = /\b(\d+)\s*GB\s*(DDR[34]|LPDDR[345]|RAM)?\b/i;
  const match = title.match(ramPattern);
  if (match) {
    return `${match[1]}GB`;
  }
  
  return undefined;
};

export const processStorage = (storage: string | undefined, title: string): string | undefined => {
  if (storage && typeof storage === 'string' && !storage.includes('undefined')) {
    return storage;
  }
  
  const storagePattern = /\b(\d+)\s*(GB|TB)\s*(SSD|HDD|eMMC|PCIe|NVMe|Storage)?\b/i;
  const match = title.match(storagePattern);
  if (match) {
    const size = match[1];
    const unit = match[2].toUpperCase();
    const type = match[3]?.toUpperCase() || 'SSD';
    return `${size}${unit} ${type}`;
  }
  
  return undefined;
};
