
/**
 * Helper utilities for processor extraction
 */

/**
 * Checks if a string contains Apple processor references
 */
export const containsAppleProcessor = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return lowerText.includes('m1') || 
         lowerText.includes('m2') || 
         lowerText.includes('m3') || 
         lowerText.includes('m4') || 
         lowerText.includes('apple') && 
         (lowerText.includes('silicon') || lowerText.includes('chip'));
};

/**
 * Checks if a string contains Intel processor references
 */
export const containsIntelProcessor = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return lowerText.includes('intel') || 
         lowerText.includes('core i') || 
         lowerText.includes('core_i') || 
         lowerText.match(/\bi[3579]\b/) !== null ||
         lowerText.includes('celeron') || 
         lowerText.includes('pentium') ||
         lowerText.includes('ultra');
};

/**
 * Checks if a string contains AMD processor references
 */
export const containsAmdProcessor = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return lowerText.includes('amd') || 
         lowerText.includes('ryzen') || 
         lowerText.match(/ryzen[_\s-][3579]/) !== null;
};

/**
 * Checks if a string contains mobile processor references
 */
export const containsMobileProcessor = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return lowerText.includes('snapdragon') || 
         lowerText.includes('mediatek');
};
