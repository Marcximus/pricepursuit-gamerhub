
/**
 * Apple processor pattern detection
 */

/**
 * Checks if a string matches Apple M-series processor patterns
 */
export const matchesAppleMSeriesPattern = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Direct check for M-series chip pattern
  if (normalizedText.match(/\bm[1234]\s+chip\b/i)) {
    return true;
  }
  
  // Check Apple context with M-series
  if ((normalizedText.includes('apple') || normalizedText.includes('macbook')) && 
      normalizedText.match(/\bm[1234]\b/i) &&
      !normalizedText.includes('ram') && 
      !normalizedText.includes('memory')) {
    return true;
  }
  
  // Improved Apple M-series patterns detection
  if (normalizedText.match(/\bm[1234](?:\s*(?:pro|max|ultra))?\b/i) &&
      !normalizedText.includes('ram') && 
      !normalizedText.includes('memory') &&
      !normalizedText.includes('ssd')) {
    return true;
  }
  
  // Check for explicit Apple Silicon mentions
  if (normalizedText.includes('apple silicon') || 
      (normalizedText.includes('apple') && normalizedText.includes('chip'))) {
    return true;
  }
  
  return false;
};

/**
 * Checks if a string contains explicit Apple processor names
 */
export const containsAppleProcessorName = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for "apple m" pattern which is a clear indicator
  if (normalizedText.includes('apple m')) {
    return true;
  }
  
  // Special case for standalone "m1", "m2", etc. references when not about RAM
  if ((normalizedText.match(/\bm[1234]\b/i) || 
       normalizedText.match(/\bm[1234]\s+chip\b/i) ||
       normalizedText.match(/chip.*m[1234]/i)) &&
      !normalizedText.includes('ram') && 
      !normalizedText.includes('memory') &&
      !normalizedText.includes('ssd')) {
    return true;
  }
  
  return false;
};
