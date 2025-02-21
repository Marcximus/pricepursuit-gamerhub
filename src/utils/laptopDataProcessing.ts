import type { Product } from "@/types/product";

const extractNumber = (text: string, pattern: RegExp): number | undefined => {
  const match = text.match(pattern);
  return match ? parseFloat(match[1]) : undefined;
};

export const processTitle = (title: string): string => {
  if (!title) return '';
  
  // Extract brand name first
  const brandPatterns = [
    /\b(HP|Dell|Lenovo|ASUS|Acer|Apple|Microsoft|MSI|Razer|Samsung|LG|Toshiba|Alienware|Gateway|Gigabyte|Huawei)\b/i,
  ];
  
  let brand = '';
  for (const pattern of brandPatterns) {
    const match = title.match(pattern);
    if (match) {
      brand = match[1];
      break;
    }
  }
  
  // Clean up the title and keep only essential model information
  let processed = title
    .replace(/^(New|Latest|2024|2023|Updated)\s*/i, '')
    .replace(/\([^)]*\)/g, '') // Remove parentheses and contents
    .replace(/\[[^\]]*\]/g, '') // Remove square brackets and contents
    .replace(/with\s+.*$/i, '') // Remove everything after 'with'
    .replace(/\b(Gaming|Business|Student)\s*(Laptop|Notebook)?\b/i, '')
    .replace(/\b(Free|Premium|Professional)\s+\w+(\s+\w+)?\b/i, '')
    .replace(/\b\d+GB\b/gi, '') // Remove RAM/storage specs
    .replace(/\b(DDR4|DDR5|SSD|HDD|PCIe|NVMe)\b/gi, '') // Remove memory/storage types
    .replace(/\b(Intel Core i[3579](-\d{4,5}[A-Z]*)?|AMD Ryzen [3579]|Intel Celeron|Intel Pentium|MediaTek|Apple M[12])\s*[\w-]*\b/gi, '') // Remove processor info
    .replace(/\b(NVIDIA GeForce RTX \d{4}|GTX \d{3,4})\b/gi, '') // Remove GPU info
    .replace(/\b\d{2,4}x\d{2,4}\b/g, '') // Remove resolution
    .replace(/\b\d+(\.\d+)?"?\s*(inch|display|screen)\b/gi, '') // Remove screen size
    .replace(/\s+/g, ' ') // Remove extra spaces
    .trim();
    
  // Combine brand with cleaned model info
  processed = brand ? `${brand} ${processed}` : processed;
  
  // Limit length and add ellipsis if needed
  return processed.length > 50 ? processed.substring(0, 47) + '...' : processed;
};

export const processProcessor = (processor: string | undefined, title: string): string | undefined => {
  // If we already have a valid processor, return it
  if (processor && typeof processor === 'string' && !processor.includes('undefined')) {
    return processor;
  }
  
  // Try to extract processor info from title
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
  // If we already have valid RAM info, return it
  if (ram && typeof ram === 'string' && !ram.includes('undefined')) {
    return ram;
  }
  
  // Try to extract RAM from title
  const ramPattern = /\b(\d+)\s*GB\s*(DDR[34]|LPDDR[345]|RAM)?\b/i;
  const match = title.match(ramPattern);
  if (match) {
    return `${match[1]}GB`;
  }
  
  return undefined;
};

export const processStorage = (storage: string | undefined, title: string): string | undefined => {
  // If we already have valid storage info, return it
  if (storage && typeof storage === 'string' && !storage.includes('undefined')) {
    return storage;
  }
  
  // Try to extract storage information from title
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

export const processGraphics = (graphics: string | undefined, title: string): string | undefined => {
  // If we already have valid graphics info, return it
  if (graphics && typeof graphics === 'string' && !graphics.includes('undefined')) {
    return graphics;
  }
  
  // Try to extract graphics info from title
  const graphicsPatterns = [
    /\b(NVIDIA GeForce RTX \d{4}(?:\s*Ti)?|NVIDIA GeForce GTX \d{3,4}(?:\s*Ti)?)\b/i,
    /\b(Intel (UHD|Iris Xe|Iris Plus) Graphics|AMD Radeon)\b/i,
    /\bRTX\s*(\d{4})(?:\s*Ti)?\b/i,
    /\bGTX\s*(\d{3,4})(?:\s*Ti)?\b/i
  ];
  
  for (const pattern of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) {
      let gpu = match[0];
      if (gpu.startsWith('RTX')) {
        gpu = 'NVIDIA GeForce ' + gpu;
      } else if (gpu.startsWith('GTX')) {
        gpu = 'NVIDIA GeForce ' + gpu;
      }
      return gpu.trim();
    }
  }
  
  // If no dedicated GPU found and we see Intel processor, assume integrated graphics
  if (title.includes('Intel')) {
    return 'Intel UHD Graphics';
  }
  
  return undefined;
};

export const processScreenSize = (screenSize: string | undefined, title: string): string | undefined => {
  // If we already have valid screen size, return it
  if (screenSize && typeof screenSize === 'string' && !screenSize.includes('undefined')) {
    return screenSize;
  }
  
  // Try to extract screen size from title
  const screenPattern = /\b([\d.]+)[-"]?\s*(?:inch|"|inches)\b/i;
  const match = title.match(screenPattern);
  if (match) {
    return `${match[1]}"`;
  }
  
  return undefined;
};

export const processWeight = (weight: string | undefined, title: string): string | undefined => {
  // If we already have valid weight info, return it
  if (weight && typeof weight === 'string' && !weight.includes('undefined')) {
    return weight;
  }
  
  // Try to extract weight from title
  const weightPattern = /\b([\d.]+)\s*(kg|pounds?|lbs?)\b/i;
  const match = title.match(weightPattern);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('lb')) {
      return `${(value * 0.453592).toFixed(2)} kg`;
    }
    return `${value} kg`;
  }
  
  return undefined;
};

export const processBatteryLife = (batteryLife: string | undefined, title: string): string | undefined => {
  // If we already have valid battery life info, return it
  if (batteryLife && typeof batteryLife === 'string' && !batteryLife.includes('undefined')) {
    return batteryLife;
  }
  
  // Try to extract battery life from title
  const batteryPattern = /\b(?:up to |(\d+)[+]?\s*(?:hour|hr)s?|(\d+)[+]?\s*(?:hour|hr)s? battery)\b/i;
  const match = title.match(batteryPattern);
  if (match) {
    const hours = match[1] || match[2];
    return `${hours} hours`;
  }
  
  return undefined;
};

export const processLaptopData = (laptop: Product): Product => {
  console.log('Processing laptop:', laptop.title);
  const processed = {
    ...laptop,
    title: processTitle(laptop.title || ''),
    processor: processProcessor(laptop.processor, laptop.title || ''),
    ram: processRam(laptop.ram, laptop.title || ''),
    storage: processStorage(laptop.storage, laptop.title || ''),
    graphics: processGraphics(laptop.graphics, laptop.title || ''),
    screen_size: processScreenSize(laptop.screen_size, laptop.title || ''),
    weight: processWeight(laptop.weight, laptop.title || ''),
    battery_life: processBatteryLife(laptop.battery_life, laptop.title || '')
  };
  console.log('Processed laptop:', processed);
  return processed;
};
