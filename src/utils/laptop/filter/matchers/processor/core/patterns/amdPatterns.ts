
/**
 * AMD processor pattern detection
 */

/**
 * Checks if a string matches AMD Ryzen patterns
 */
export const matchesAmdRyzenPattern = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for AMD Ryzen patterns
  if (normalizedText.match(/\bryzen[_\s-]*[3579](?:[_\s-]\d{4}[a-z]*)?\b/i)) {
    return true;
  }
  
  return false;
};

/**
 * Checks if a string contains an explicit AMD processor name
 */
export const containsAmdProcessorName = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for "amd ryzen" pattern which is a clear indicator
  if (normalizedText.includes('amd ryzen')) {
    return true;
  }
  
  return false;
};
