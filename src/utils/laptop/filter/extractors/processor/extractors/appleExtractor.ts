
import { appleSiliconPatterns } from '../processorPatterns';

/**
 * Extracts Apple Silicon processors from a laptop title
 */
export const extractAppleProcessor = (normalizedTitle: string): string | null => {
  // Special handling for MacBook M2 titles
  if ((normalizedTitle.includes('macbook') || normalizedTitle.includes('mac book')) && 
      normalizedTitle.includes('m2')) {
    // Check for variants
    if (normalizedTitle.includes('pro') && !normalizedTitle.includes('m2 pro')) {
      return 'Apple M2 Pro chip';
    } else if (normalizedTitle.includes('max') && !normalizedTitle.includes('m2 max')) {
      return 'Apple M2 Max chip';
    } else if (normalizedTitle.includes('ultra') && !normalizedTitle.includes('m2 ultra')) {
      return 'Apple M2 Ultra chip';
    } else {
      return 'Apple M2 Chip';
    }
  }
  
  // Try to extract Apple Silicon
  const appleMatch = normalizedTitle.match(appleSiliconPatterns.appleWithVariant);
  if (appleMatch) {
    const variant = appleMatch[2] ? ` ${appleMatch[2].charAt(0).toUpperCase() + appleMatch[2].slice(1)}` : '';
    return `Apple M${appleMatch[1]}${variant} Chip`;
  }
  
  // Try to extract M-series without Apple prefix
  const mSeriesMatch = normalizedTitle.match(appleSiliconPatterns.mSeriesWithVariant);
  if (mSeriesMatch && !normalizedTitle.includes('ram') && !normalizedTitle.includes('memory')) {
    const variant = mSeriesMatch[2] ? ` ${mSeriesMatch[2].charAt(0).toUpperCase() + mSeriesMatch[2].slice(1)}` : '';
    return `Apple M${mSeriesMatch[1]}${variant} Chip`;
  }
  
  // Try to extract MacBook with M-series
  const macbookMMatch = normalizedTitle.match(appleSiliconPatterns.macbookWithM);
  if (macbookMMatch) {
    const variant = macbookMMatch[2] ? ` ${macbookMMatch[2].charAt(0).toUpperCase() + macbookMMatch[2].slice(1)}` : '';
    return `Apple M${macbookMMatch[1]}${variant} Chip`;
  }
  
  // Try to extract M-series with core count
  const mCoreMatch = normalizedTitle.match(appleSiliconPatterns.mWithCore);
  if (mCoreMatch) {
    const variant = mCoreMatch[2] ? ` ${mCoreMatch[2].charAt(0).toUpperCase() + mCoreMatch[2].slice(1)}` : '';
    return `Apple M${mCoreMatch[1]}${variant} Chip`;
  }
  
  // Try to extract M-series with RAM mention
  const mRamMatch = normalizedTitle.match(appleSiliconPatterns.mSeriesWithRam);
  if (mRamMatch) {
    const variant = mRamMatch[2] ? ` ${mRamMatch[2].charAt(0).toUpperCase() + mRamMatch[2].slice(1)}` : '';
    return `Apple M${mRamMatch[1]}${variant} Chip`;
  }
  
  return null;
};

/**
 * Handle special case for "Apple" processor value in a MacBook context
 */
export const enhanceAppleProcessor = (normalizedTitle: string): string | null => {
  if (normalizedTitle.includes('macbook') || normalizedTitle.includes('mac book')) {
    if (normalizedTitle.includes('m2')) {
      return 'Apple M2 Chip';
    } else if (normalizedTitle.includes('m1')) {
      return 'Apple M1 Chip';
    } else if (normalizedTitle.includes('m3')) {
      return 'Apple M3 Chip';
    } else if (normalizedTitle.includes('m4')) {
      return 'Apple M4 Chip';
    }
  }
  return null;
};
