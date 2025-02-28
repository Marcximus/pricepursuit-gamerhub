
import { getRamValue, getStorageValue, getScreenSizeValue } from './valueParser';
import { getProcessorValue, getGraphicsValue } from './hardwareScoring';

/**
 * Normalizes RAM strings for consistent display
 */
export const normalizeRam = (ram: string): string => {
  if (!ram) return '';
  
  const gbValue = getRamValue(ram);
  if (gbValue === 0) return ram;
  
  // Format as integer if it's a whole number, otherwise show decimal
  const formattedGB = Number.isInteger(gbValue) ? gbValue.toString() : gbValue.toFixed(1);
  return `${formattedGB} GB`;
};

/**
 * Normalizes storage strings for consistent display
 */
export const normalizeStorage = (storage: string): string => {
  if (!storage) return '';
  
  // Get storage value in GB
  const gbValue = getStorageValue(storage);
  
  // Filter out invalid or unrealistic storage values (less than 32GB)
  if (gbValue < 32) {
    return '';
  }
  
  // Convert to TB if ≥ 1000 GB
  if (gbValue >= 1000) {
    const tbValue = gbValue / 1024;
    return `${tbValue.toFixed(tbValue % 1 === 0 ? 0 : 1)} TB`;
  }
  
  return `${Math.round(gbValue)} GB`;
};

/**
 * Normalizes screen size strings for consistent display
 */
export const normalizeScreenSize = (size: string): string => {
  if (!size) return '';
  
  // Extract the numeric value and standardize to inches
  const match = size.match(/(\d+\.?\d*)/);
  if (match) {
    return `${match[1]}"`;
  }
  return size;
};

/**
 * Normalizes graphics card strings for consistent display
 */
export const normalizeGraphics = (graphics: string): string => {
  if (!graphics) return '';
  
  // Clean up common inconsistencies
  let normalized = graphics
    .replace(/\s+/g, ' ')
    .replace(/Graphics\s+Card:?/i, '')
    .replace(/Integrated\s+Graphics:?/i, '')
    .replace(/GPU:?/i, '')
    .trim();
  
  // Standardize NVIDIA naming
  normalized = normalized
    .replace(/nvidia\s+geforce\s+rtx?/i, 'NVIDIA RTX')
    .replace(/nvidia\s+geforce\s+gtx?/i, 'NVIDIA GTX')
    .replace(/nvidia\s+rtx?/i, 'NVIDIA RTX')
    .replace(/nvidia\s+gtx?/i, 'NVIDIA GTX')
    .replace(/geforce\s+rtx?/i, 'NVIDIA RTX')
    .replace(/geforce\s+gtx?/i, 'NVIDIA GTX');
    
  // Standardize Intel naming
  normalized = normalized
    .replace(/intel(\s+iris)?(\s+xe)?\s+graphics/i, 'Intel Iris Xe Graphics')
    .replace(/intel\s+uhd\s+graphics/i, 'Intel UHD Graphics')
    .replace(/intel\s+hd\s+graphics/i, 'Intel HD Graphics');
    
  // Standardize AMD naming
  normalized = normalized
    .replace(/amd\s+radeon/i, 'AMD Radeon')
    .replace(/radeon/i, 'AMD Radeon');
    
  // Apple naming
  normalized = normalized
    .replace(/apple\s+m1/i, 'Apple M1')
    .replace(/apple\s+m2/i, 'Apple M2')
    .replace(/apple\s+m3/i, 'Apple M3')
    .replace(/m1\s+gpu/i, 'Apple M1')
    .replace(/m2\s+gpu/i, 'Apple M2')
    .replace(/m3\s+gpu/i, 'Apple M3');
    
  return normalized;
};

/**
 * Normalizes processor strings for consistent display
 */
export const normalizeProcessor = (processor: string): string => {
  if (!processor) return '';
  
  // Clean up common inconsistencies
  let normalized = processor
    .replace(/\s+/g, ' ')
    .replace(/Processor:?/i, '')
    .replace(/CPU:?/i, '')
    .trim();
  
  // Standardize Intel naming
  normalized = normalized
    .replace(/intel\s+core\s+i([3579])[- ](\d{4,5})(H|U|HQ|K)?/i, 'Intel Core i$1-$2$3')
    .replace(/intel\s+core\s+i([3579])[- ](\d{1,2}th)\s+gen/i, 'Intel Core i$1 $2 Gen')
    .replace(/intel\s+core\s+i([3579])/i, 'Intel Core i$1');
    
  // Standardize AMD naming
  normalized = normalized
    .replace(/amd\s+ryzen\s+([3579])[- ](\d{4})(H|U|HS|HX)?/i, 'AMD Ryzen $1-$2$3')
    .replace(/amd\s+ryzen\s+([3579])/i, 'AMD Ryzen $1');
    
  // Apple naming
  normalized = normalized
    .replace(/apple\s+m1(\s+pro|\s+max)?/i, 'Apple M1$1')
    .replace(/apple\s+m2(\s+pro|\s+max)?/i, 'Apple M2$1')
    .replace(/apple\s+m3(\s+pro|\s+max)?/i, 'Apple M3$1')
    .replace(/m1(\s+pro|\s+max)?/i, 'Apple M1$1')
    .replace(/m2(\s+pro|\s+max)?/i, 'Apple M2$1')
    .replace(/m3(\s+pro|\s+max)?/i, 'Apple M3$1');
    
  return normalized;
};

/**
 * Extract brand from title or stored brand with better normalization
 */
export const normalizeBrand = (brand: string, title?: string): string => {
  if (!brand && !title) return 'Unknown Brand';
  
  // Known laptop brands with proper capitalization
  const BRAND_CORRECTIONS: {[key: string]: string} = {
    'apple': 'Apple',
    'lenovo': 'Lenovo',
    'hp': 'HP',
    'dell': 'Dell',
    'asus': 'ASUS',
    'acer': 'Acer',
    'msi': 'MSI',
    'samsung': 'Samsung',
    'microsoft': 'Microsoft',
    'lg': 'LG',
    'razer': 'Razer',
    'toshiba': 'Toshiba',
    'gigabyte': 'Gigabyte',
    'huawei': 'Huawei',
    'xiaomi': 'Xiaomi',
    'alienware': 'Alienware'
  };

  // Brand identification patterns
  const BRAND_PATTERNS: {[key: string]: RegExp[]} = {
    'Apple': [/\bmacbook\b/i, /\bipad\b/i, /\bmac\b/i, /\bapple\b/i, /\bm1\b/i, /\bm2\b/i, /\bm3\b/i],
    'Lenovo': [/\blenovo\b/i, /\bthinkpad\b/i, /\bideapad\b/i, /\byoga\b/i, /\blegion\b/i],
    'HP': [/\bhp\b/i, /\bspectre\b/i, /\bpavilion\b/i, /\benvy\b/i, /\bomen\b/i],
    'Dell': [/\bdell\b/i, /\bxps\b/i, /\binspiron\b/i, /\blatitude\b/i, /\bprecision\b/i],
    'ASUS': [/\basus\b/i, /\bzenbook\b/i, /\brog\b/i, /\btuf\b/i, /\bvivobook\b/i],
    'Acer': [/\bacer\b/i, /\baspire\b/i, /\bpredator\b/i, /\bnitro\b/i, /\bswift\b/i],
    'MSI': [/\bmsi\b/i, /\braider\b/i, /\bstealth\b/i, /\btitan\b/i, /\bprestige\b/i],
    'Samsung': [/\bsamsung\b/i, /\bgalaxy book\b/i, /\bodyssey\b/i],
    'Microsoft': [/\bmicrosoft\b/i, /\bsurface\b/i],
    'Razer': [/\brazer\b/i, /\bblade\b/i],
    'Alienware': [/\balienware\b/i],
    'LG': [/\blg\b/i, /\bgram\b/i]
  };
  
  // First check if title contains known brand keywords
  if (title) {
    const titleLower = title.toLowerCase();
    for (const [brandName, patterns] of Object.entries(BRAND_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(titleLower)) {
          return brandName;
        }
      }
    }
  }
  
  // If no brand found in title, try the stored brand
  if (brand) {
    const normalizedBrand = brand.toLowerCase().trim();
    if (BRAND_CORRECTIONS[normalizedBrand]) {
      return BRAND_CORRECTIONS[normalizedBrand];
    }
    
    // Detect known brands in the stored brand string
    for (const [brandName, patterns] of Object.entries(BRAND_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedBrand)) {
          return brandName;
        }
      }
    }
    
    // If not a known brand, capitalize first letter
    return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  }
  
  return 'Unknown Brand';
};

/**
 * Extract and normalize model from title
 */
export const normalizeModel = (model: string | null, title: string, brand?: string): string => {
  if (model && model.trim() !== '') {
    return model.trim();
  }
  
  // If no model provided, try to extract from title based on brand
  if (!brand || brand === 'Unknown Brand') {
    return '';
  }
  
  const titleLower = title.toLowerCase();
  const brandLower = brand.toLowerCase();
  
  switch (brandLower) {
    case 'apple':
      if (titleLower.includes('macbook')) {
        // Extract MacBook model (Air, Pro, etc.)
        const macbookMatch = title.match(/MacBook\s+(Air|Pro)(\s+\d+\.\d+")?/i);
        return macbookMatch ? macbookMatch[0] : '';
      }
      break;
      
    case 'dell':
      // Extract Dell model (XPS, Inspiron, etc.)
      const dellMatch = title.match(/\b(XPS|Inspiron|Latitude|Precision)\s+\d+/i);
      return dellMatch ? dellMatch[0] : '';
      
    case 'hp':
      // Extract HP model (Spectre, Pavilion, Envy, etc.)
      const hpMatch = title.match(/\b(Spectre|Pavilion|Envy|Omen|EliteBook)\s+\w+(-\w+)?/i);
      return hpMatch ? hpMatch[0] : '';
      
    case 'lenovo':
      // Extract Lenovo model (ThinkPad, IdeaPad, Yoga, etc.)
      const lenovoMatch = title.match(/\b(ThinkPad|IdeaPad|Yoga|Legion)\s+\w+(-\w+)?/i);
      return lenovoMatch ? lenovoMatch[0] : '';
      
    case 'asus':
      // Extract ASUS model (ZenBook, ROG, VivoBook, etc.)
      const asusMatch = title.match(/\b(ZenBook|ROG|VivoBook|TUF)\s+\w+(-\w+)?/i);
      return asusMatch ? asusMatch[0] : '';
      
    default:
      return '';
  }
  
  return '';
};
