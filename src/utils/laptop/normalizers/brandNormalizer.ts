
// Brand identification patterns 
const BRAND_PATTERNS: {[key: string]: RegExp[]} = {
  'Apple': [/\bmacbook\b/i, /\bipad\b/i, /\bmac\b/i, /\bapple\b/i, /\bm1\b/i, /\bm2\b/i, /\bm3\b/i],
  'Lenovo': [/\blenovo\b/i, /\bthinkpad\b/i, /\bideapad\b/i, /\byoga\b/i, /\blegion\b/i],
  'HP': [/\bhp\b/i, /\bspectre\b/i, /\bpavilion\b/i, /\benvy\b/i, /\bomen\b/i, /\belitebook\b/i, /\bprobook\b/i],
  'Dell': [/\bdell\b/i, /\bxps\b/i, /\binspiron\b/i, /\blatitude\b/i, /\bprecision\b/i, /\bvostro\b/i],
  'ASUS': [/\basus\b/i, /\bzenbook\b/i, /\brog\b/i, /\btuf\b/i, /\bvivobook\b/i],
  'Acer': [/\bacer\b/i, /\baspire\b/i, /\bpredator\b/i, /\bnitro\b/i, /\bswift\b/i],
  'MSI': [/\bmsi\b/i, /\braider\b/i, /\bstealth\b/i, /\btitan\b/i, /\bprestige\b/i],
  'Samsung': [/\bsamsung\b/i, /\bgalaxy book\b/i, /\bodyssey\b/i],
  'Microsoft': [/\bmicrosoft\b/i, /\bsurface\b/i],
  'Razer': [/\brazer\b/i, /\bblade\b/i],
  'Alienware': [/\balienware\b/i],
  'LG': [/\blg\b/i, /\bgram\b/i],
  'Gigabyte': [/\bgigabyte\b/i, /\baero\b/i],
  'Huawei': [/\bhuawei\b/i, /\bmatebook\b/i],
  'Xiaomi': [/\bxiaomi\b/i, /\bredmi\b/i, /\bmi notebook\b/i]
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
  'alienware': 'Alienware',
  'vaio': 'VAIO',
  'fsjun': 'FSJUN',
  'jumper': 'Jumper',
  'acemagic': 'ACEMAGIC'
};

// Cache for brand normalization
const brandNormalizationCache = new Map<string, string>();

/**
 * Extract brand from title or stored brand with improved performance via caching
 */
export const normalizeBrand = (brand: string, title?: string): string => {
  // Create a unique cache key
  const cacheKey = `${brand}|${title || ''}`;
  
  // Check if we have a cached result
  if (brandNormalizationCache.has(cacheKey)) {
    return brandNormalizationCache.get(cacheKey)!;
  }
  
  let result: string;
  
  if (!brand && !title) {
    result = 'Unknown Brand';
  } else {
    // First check if title contains known brand keywords
    if (title) {
      const titleLower = title.toLowerCase();
      let brandFound = false;
      
      for (const [brandName, patterns] of Object.entries(BRAND_PATTERNS)) {
        for (const pattern of patterns) {
          if (pattern.test(titleLower)) {
            result = brandName;
            brandFound = true;
            break;
          }
        }
        if (brandFound) break;
      }
      
      // If no brand found in title, try the stored brand
      if (!brandFound) {
        if (brand) {
          const normalizedBrand = brand.toLowerCase().trim();
          if (BRAND_CORRECTIONS[normalizedBrand]) {
            result = BRAND_CORRECTIONS[normalizedBrand];
          } else {
            // Detect known brands in the stored brand string
            let brandDetected = false;
            for (const [brandName, patterns] of Object.entries(BRAND_PATTERNS)) {
              for (const pattern of patterns) {
                if (pattern.test(normalizedBrand)) {
                  result = brandName;
                  brandDetected = true;
                  break;
                }
              }
              if (brandDetected) break;
            }
            
            // If not a known brand, capitalize first letter
            if (!brandDetected) {
              result = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
            }
          }
        } else {
          result = 'Unknown Brand';
        }
      }
    } else if (brand) {
      // Only have brand, no title
      const normalizedBrand = brand.toLowerCase().trim();
      if (BRAND_CORRECTIONS[normalizedBrand]) {
        result = BRAND_CORRECTIONS[normalizedBrand];
      } else {
        // If not a known brand, capitalize first letter
        result = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
      }
    } else {
      result = 'Unknown Brand';
    }
  }
  
  // Cache the result
  brandNormalizationCache.set(cacheKey, result);
  return result;
};

export { BRAND_PATTERNS, BRAND_CORRECTIONS };
