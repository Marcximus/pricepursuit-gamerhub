
/**
 * Normalize Apple graphics card information
 */
import { GRAPHICS_PATTERNS } from './constants';

export const normalizeAppleGraphics = (normalizedString: string): string | null => {
  const productLower = normalizedString.toLowerCase();
  
  if (!GRAPHICS_PATTERNS.APPLE.PREFIX.test(productLower)) {
    return null;
  }

  const mSeriesMatch = normalizedString.match(GRAPHICS_PATTERNS.APPLE.M_SERIES);
  if (mSeriesMatch) {
    const mVersion = mSeriesMatch[1]; // 1, 2, or 3
    const mVariant = mSeriesMatch[2] ? ` ${mSeriesMatch[2].charAt(0).toUpperCase() + mSeriesMatch[2].slice(1)}` : '';
    
    // Try to extract core count
    let coreCount = '';
    const coreMatch = normalizedString.match(/(\d+)[\s-]core/i);
    if (coreMatch) {
      coreCount = ` with ${coreMatch[1]}-core`;
    }
    
    return `Apple M${mVersion}${mVariant}${coreCount} GPU`;
  }
  
  // More generic Apple GPU standardization
  let result = normalizedString
    .replace(/apple\s+m(\d)(\s+(pro|max|ultra))?(\s+gpu)?/i, 'Apple M$1$2 GPU')
    .replace(/m(\d)(\s+(pro|max|ultra))?\s+gpu/i, 'Apple M$1$2 GPU');
  
  return result;
};
