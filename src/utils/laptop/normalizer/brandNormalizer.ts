
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
