
/**
 * Normalize Intel graphics card information
 */
import { GRAPHICS_PATTERNS } from './constants';

export const normalizeIntelGraphics = (normalizedString: string): string | null => {
  const productLower = normalizedString.toLowerCase();
  
  if (!GRAPHICS_PATTERNS.INTEL.PREFIX.test(productLower) && 
      !GRAPHICS_PATTERNS.INTEL.IRIS_XE.test(productLower) && 
      !GRAPHICS_PATTERNS.INTEL.UHD.test(productLower) && 
      !GRAPHICS_PATTERNS.INTEL.HD.test(productLower)) {
    return null;
  }

  // Handle Arc series
  const arcMatch = normalizedString.match(GRAPHICS_PATTERNS.INTEL.ARC_SERIES);
  if (arcMatch) {
    return `Intel Arc ${arcMatch[1].toUpperCase()}`;
  }
  
  // Try to extract generation numbers
  let genNumber = '';
  const genMatch = normalizedString.match(/\b(\d{3,4})\b/);
  if (genMatch) {
    genNumber = ` ${genMatch[1]}`;
  }
  
  // Standardize other Intel graphics
  let result = normalizedString
    // Combine Iris Xe and regular Iris into one category
    .replace(/intel\s+iris\s+xe\s+graphics/i, `Intel Iris Graphics`)
    .replace(/intel\s+iris\s+graphics/i, `Intel Iris Graphics`)
    .replace(/intel\s+iris\s+plus\s+graphics/i, `Intel Iris Plus Graphics`)
    .replace(/intel\s+uhd\s+graphics/i, `Intel UHD${genNumber} Graphics`)
    .replace(/intel\s+hd\s+graphics/i, `Intel HD${genNumber} Graphics`)
    .replace(/\bIris\s+Xe\b/i, `Intel Iris Graphics`)
    .replace(/\bUHD\s+Graphics\b/i, `Intel UHD${genNumber} Graphics`)
    .replace(/\bHD\s+Graphics\b/i, `Intel HD${genNumber} Graphics`);
  
  // Ensure Intel prefix is present
  if (!result.toLowerCase().includes('intel')) {
    result = `Intel ${result}`;
  }
  
  // Add "Graphics" suffix if missing
  if (!result.toLowerCase().includes('graphics')) {
    result += ' Graphics';
  }
  
  return result;
};
