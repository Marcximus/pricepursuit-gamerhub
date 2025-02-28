
import { getRamValue, getStorageValue, getScreenSizeValue } from './valueParser';
import { KNOWN_BRANDS } from './hardwareScoring';

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
  
  const normalizedGraphics = graphics.toLowerCase();
  
  // Skip extremely vague descriptions
  if (normalizedGraphics === 'integrated' || 
      normalizedGraphics === 'integrated graphics' ||
      normalizedGraphics === 'graphics') {
    return '';
  }
  
  // NVIDIA GPUs
  const nvidia = normalizedGraphics.match(/(?:nvidia\s+)?(?:geforce\s+)?(rtx|gtx)\s*(\d{4}|\d{3})(?:\s*(ti|super|max-q))?/i);
  if (nvidia) {
    const [_, series, model, variant] = nvidia;
    return `NVIDIA ${series.toUpperCase()} ${model}${variant ? ' ' + variant.charAt(0).toUpperCase() + variant.slice(1) : ''}`;
  }
  
  // AMD GPUs
  const amd = normalizedGraphics.match(/(?:amd\s+)?radeon(?:\s+(rx)\s*(\d{4}|\d{3}))?/i);
  if (amd) {
    if (amd[1] && amd[2]) {
      return `AMD Radeon ${amd[1].toUpperCase()} ${amd[2]}`;
    }
    return "AMD Radeon Graphics";
  }
  
  // Intel Graphics
  const intel = normalizedGraphics.match(/intel\s+(iris\s+xe|iris|uhd|hd)(?:\s+graphics)?/i);
  if (intel) {
    let intelModel = intel[1].toLowerCase();
    if (intelModel === 'iris xe') return 'Intel Iris Xe Graphics';
    if (intelModel === 'iris') return 'Intel Iris Graphics';
    if (intelModel === 'uhd') return 'Intel UHD Graphics';
    if (intelModel === 'hd') return 'Intel HD Graphics';
    return `Intel ${intel[1]} Graphics`;
  }
  
  // Apple Graphics
  if (normalizedGraphics.includes('apple') && 
      (normalizedGraphics.includes('m1') || normalizedGraphics.includes('m2') || normalizedGraphics.includes('m3'))) {
    
    if (normalizedGraphics.includes('m3')) {
      return normalizedGraphics.includes('pro') ? 'Apple M3 Pro GPU' : 
             normalizedGraphics.includes('max') ? 'Apple M3 Max GPU' : 'Apple M3 GPU';
    } else if (normalizedGraphics.includes('m2')) {
      return normalizedGraphics.includes('pro') ? 'Apple M2 Pro GPU' : 
             normalizedGraphics.includes('max') ? 'Apple M2 Max GPU' : 'Apple M2 GPU';
    } else {
      return normalizedGraphics.includes('pro') ? 'Apple M1 Pro GPU' : 
             normalizedGraphics.includes('max') ? 'Apple M1 Max GPU' : 'Apple M1 GPU';
    }
  }
  
  // Clean up if still has the word "graphics" missing
  if (!normalizedGraphics.includes('graphics') && 
      !normalizedGraphics.includes('gpu') &&
      normalizedGraphics !== '') {
    return graphics + ' Graphics';
  }
  
  return graphics;
};

/**
 * Normalizes processor strings for consistent display
 */
export const normalizeProcessor = (processor: string): string => {
  if (!processor) return '';
  
  const normalizedProcessor = processor.toLowerCase();
  
  // Intel processors
  const intel = normalizedProcessor.match(/(?:intel\s+)?(?:core\s+)?(i[3579])[\s-](\d{4,5}[a-z]*)/i);
  if (intel) {
    const generation = intel[2][0]; // First digit of model number is generation
    return `Intel Core ${intel[1].toUpperCase()}-${intel[2]} (${generation}th Gen)`;
  }
  
  // AMD Ryzen processors
  const amd = normalizedProcessor.match(/(?:amd\s+)?ryzen\s+([3579])\s+(\d{4}[a-z]*)/i);
  if (amd) {
    return `AMD Ryzen ${amd[1]} ${amd[2]}`;
  }
  
  // Apple M-series processors
  const apple = normalizedProcessor.match(/(?:apple\s+)?(m[123])(?:\s+(pro|max|ultra))?/i);
  if (apple) {
    return `Apple ${apple[1].toUpperCase()}${apple[2] ? ' ' + apple[2].charAt(0).toUpperCase() + apple[2].slice(1) : ''} Chip`;
  }
  
  // If no specific format matched but contains keywords, standardize capitalization
  if (normalizedProcessor.includes('intel')) {
    return processor.replace(/intel/i, 'Intel').replace(/core/i, 'Core');
  }
  
  if (normalizedProcessor.includes('amd')) {
    return processor.replace(/amd/i, 'AMD').replace(/ryzen/i, 'Ryzen');
  }
  
  if (normalizedProcessor.includes('apple')) {
    return processor.replace(/apple/i, 'Apple');
  }
  
  return processor;
};

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
  'medion': 'Medion',
  'alienware': 'Alienware'
};

// Brand identification patterns to prevent incorrect brand detection
const BRAND_PATTERNS: {[key: string]: RegExp[]} = {
  'Apple': [/\bmacbook\b/i, /\bipad\b/i, /\bmac\b/i, /\bapple\b/i, /\bm1\b/i, /\bm2\b/i, /\bm3\b/i],
  'Lenovo': [/\blenovo\b/i, /\bthinkpad\b/i, /\bideapad\b/i, /\byoga\b/i, /\blegion\b/i],
  'HP': [/\bhp\b/i, /\bspectre\b/i, /\bpavilion\b/i, /\benvy\b/i, /\bomen\b/i, /\belitebook\b/i, /\bprobook\b/i],
  'Dell': [/\bdell\b/i, /\bxps\b/i, /\binspiron\b/i, /\blatitude\b/i, /\bprecision\b/i, /\bvostro\b/i],
  'ASUS': [/\basus\b/i, /\bzenbook\b/i, /\brog\b/i, /\btuf\b/i, /\bvivobook\b/i],
  'Acer': [/\bacer\b/i, /\baspire\b/i, /\bpredator\b/i, /\bnitro\b/i, /\bswift\b/i, /\bspin\b/i],
  'MSI': [/\bmsi\b/i, /\braider\b/i, /\bstealth\b/i, /\btitan\b/i, /\bprestige\b/i, /\bsword\b/i, /\bkatana\b/i],
  'Samsung': [/\bsamsung\b/i, /\bgalaxy book\b/i, /\bodyssey\b/i],
  'Microsoft': [/\bmicrosoft\b/i, /\bsurface\b/i],
  'Razer': [/\brazer\b/i, /\bblade\b/i],
  'Alienware': [/\balienware\b/i],
  'LG': [/\blg\b/i, /\bgram\b/i]
};

/**
 * Detect the correct brand from the title and stored brand
 */
function detectCorrectBrand(title: string, storedBrand?: string): string {
  if (!title) {
    return correctBrandCapitalization(storedBrand) || 'Unknown Brand';
  }
  
  const titleLower = title.toLowerCase();
  
  // First check if the title contains known brand keywords
  for (const [brand, patterns] of Object.entries(BRAND_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(titleLower)) {
        return brand;
      }
    }
  }
  
  // If no brand pattern matched, use the stored brand
  return correctBrandCapitalization(storedBrand) || 'Unknown Brand';
}

/**
 * Correct brand capitalization
 */
function correctBrandCapitalization(brand?: string): string {
  if (!brand) return '';
  
  const normalizedBrand = brand.toLowerCase().trim();
  if (BRAND_CORRECTIONS[normalizedBrand]) {
    return BRAND_CORRECTIONS[normalizedBrand];
  }
  
  // If not a known brand, capitalize first letter
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
}

/**
 * Normalizes brand names for consistent display
 * Now using the robust detectCorrectBrand function
 */
export const normalizeBrand = (brand: string, title?: string): string => {
  if (!brand && !title) return '';
  
  // Use the robust brand detection logic that checks for known patterns
  return detectCorrectBrand(title || '', brand);
};
