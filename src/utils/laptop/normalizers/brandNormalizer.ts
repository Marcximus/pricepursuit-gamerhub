
/**
 * Normalizes laptop brand names for consistency
 */

// Define top laptop brands with variations for matching
const KNOWN_BRANDS: { [key: string]: string[] } = {
  'Apple': ['apple', 'macbook', 'mac book', 'mac-book'],
  'HP': ['hp', 'hewlett packard', 'hewlett-packard', 'h-p', 'h p'],
  'Dell': ['dell'],
  'Lenovo': ['lenovo', 'thinkpad', 'think pad', 'ideapad'],
  'ASUS': ['asus', 'zenbook', 'vivobook', 'tuf gaming', 'rog'],
  'Acer': ['acer', 'aspire', 'nitro', 'predator'],
  'Microsoft': ['microsoft', 'surface', 'surface laptop', 'surface book'],
  'MSI': ['msi'],
  'Samsung': ['samsung', 'galaxy book'],
  'LG': ['lg', 'lg gram'],
  'Razer': ['razer', 'razer blade'],
  'Toshiba': ['toshiba'],
  'Gateway': ['gateway'],
  'Alienware': ['alienware', 'alien-ware', 'alien ware'],
  'Gigabyte': ['gigabyte', 'aorus'],
  'Huawei': ['huawei', 'matebook'],
  'Framework': ['framework'],
  'Sony': ['sony', 'vaio'],
  'Panasonic': ['panasonic', 'toughbook', 'tough book'],
  'Google': ['google', 'pixelbook', 'pixel book']
};

/**
 * Normalize brand name for consistency
 * 
 * @param storedBrand The brand value stored in the database
 * @param title The product title to extract brand from if needed
 * @returns Normalized brand name
 */
export const normalizeBrand = (
  storedBrand: string,
  title: string
): string => {
  // Handle undefined or null inputs safely
  const safeStoredBrand = storedBrand || '';
  const safeTitle = title || '';
  
  // If stored brand is already populated and valid, use it
  if (safeStoredBrand && safeStoredBrand.trim().length > 0) {
    // Check if the stored brand is a known brand with a preferred format
    for (const [normalizedBrand, variations] of Object.entries(KNOWN_BRANDS)) {
      if (variations.some(variation => safeStoredBrand.toLowerCase().includes(variation))) {
        return normalizedBrand;
      }
    }
    
    // If not a known brand, return the stored brand with first letter capitalized
    return safeStoredBrand.charAt(0).toUpperCase() + safeStoredBrand.slice(1).toLowerCase();
  }
  
  // Try to extract brand from title
  const lowerTitle = safeTitle.toLowerCase();
  
  for (const [normalizedBrand, variations] of Object.entries(KNOWN_BRANDS)) {
    if (variations.some(variation => lowerTitle.includes(variation))) {
      return normalizedBrand;
    }
  }
  
  // Default to 'Unknown' if we can't determine brand
  return 'Unknown';
};
