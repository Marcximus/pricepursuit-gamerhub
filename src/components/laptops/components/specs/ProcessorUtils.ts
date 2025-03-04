
/**
 * Utility functions for processor display in laptop specs
 */

/**
 * Extracts Apple M-series processor information from title
 */
export const extractAppleProcessor = (title: string): string | null => {
  if (!title) return null;
  
  const titleLower = title.toLowerCase();
  
  // Check for MacBook with M-series chips
  const mSeriesMatch = titleLower.match(/\bm([1234])\s*(pro|max|ultra)?\b/i);
  if (mSeriesMatch && titleLower.includes('macbook')) {
    const mSeries = mSeriesMatch[1];
    const variant = mSeriesMatch[2] ? ` ${mSeriesMatch[2].charAt(0).toUpperCase() + mSeriesMatch[2].slice(1)}` : '';
    return `Apple M${mSeries}${variant} chip`;
  }
  
  // If title explicitly mentions "chip", make sure we capture it
  if (titleLower.match(/apple\s+m[1234]\s+chip/i)) {
    const chipMatch = titleLower.match(/apple\s+m([1234])\s+chip/i);
    if (chipMatch) {
      return `Apple M${chipMatch[1]} chip`;
    }
  }
  
  return null;
};

/**
 * Enhance graphics display for Apple Silicon MacBooks
 */
export const getAppleSiliconGraphics = (title: string): string | null => {
  if (!title) return null;
  
  const titleLower = title.toLowerCase();
  const mSeriesMatch = titleLower.match(/\bm([1234])\s*(pro|max|ultra)?\b/i);
  
  if (mSeriesMatch && titleLower.includes('macbook')) {
    const mSeries = mSeriesMatch[1];
    const variant = mSeriesMatch[2] ? ` ${mSeriesMatch[2].charAt(0).toUpperCase() + mSeriesMatch[2].slice(1)}` : '';
    
    // Check for GPU core count in title (e.g., "10-core GPU")
    const coreMatch = titleLower.match(/(\d+)[\s-]core\s+gpu/i);
    const coreInfo = coreMatch ? ` with ${coreMatch[1]}-core` : '';
    
    return `Apple M${mSeries}${variant}${coreInfo} GPU`;
  }
  
  return null;
};

/**
 * Extract RAM for MacBooks from title
 */
export const extractMacBookRam = (title: string): string | null => {
  if (!title) return null;
  
  const titleLower = title.toLowerCase();
  if (titleLower.includes('macbook')) {
    // Look for GB RAM pattern in MacBook titles
    const ramMatch = titleLower.match(/(\d+)\s*gb(?:\s+unified)?\s+(?:ram|memory)/i);
    if (ramMatch) {
      return `${ramMatch[1]}GB${titleLower.includes('unified') ? ' Unified' : ''}`;
    }
    // Also try looking for simple GB pattern not near storage terms
    const simpleRamMatch = titleLower.match(/(\d+)\s*gb\b(?!\s*(?:ssd|storage|drive))/i);
    if (simpleRamMatch) {
      return `${simpleRamMatch[1]}GB${titleLower.includes('unified') ? ' Unified' : ''}`;
    }
  }
  
  return null;
};
