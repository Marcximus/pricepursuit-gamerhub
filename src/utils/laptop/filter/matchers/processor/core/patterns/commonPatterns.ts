
/**
 * Common processor pattern detection shared across different processor types
 */

/**
 * Checks if a processor name is explicitly mentioned in a string
 */
export const containsMainProcessorCategory = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Direct inclusion check for main categories
  const mainProcessorCategories = [
    'apple m', 'intel core i', 'intel core ultra', 'amd ryzen', 
    'intel celeron', 'intel pentium', 'qualcomm snapdragon', 'mediatek'
  ];
  
  return mainProcessorCategories.some(category => 
    normalizedText.includes(category.toLowerCase())
  );
};

/**
 * Checks if a string contains mobile processor names (Snapdragon, MediaTek)
 */
export const containsMobileProcessorName = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  return normalizedText.includes('snapdragon') || normalizedText.includes('mediatek');
};
