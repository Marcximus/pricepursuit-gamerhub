
/**
 * Functions for processing and normalizing laptop titles
 */

export const processTitle = (title: string): string => {
  if (!title) return '';
  
  // Clean up title
  let processedTitle = title
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/\s*\(\s*\w+:\s*[^)]+\)\s*/g, ' ') // Remove parentheses with attribute info
    .trim();
  
  // Remove common patterns that make titles too long
  processedTitle = processedTitle
    .replace(/\b(?:with|featuring|includes|including)\s+(?:Microsoft|MS)\s+Office\b[^,]*/i, '')
    .replace(/\b(?:with|featuring|includes|including)\s+Windows\s+\d+[^,]*/i, '')
    .replace(/\bLatest(?:\s+\w+){1,3}\s+(?:Model|Edition|Version)\b/i, '')
    .replace(/\b\d{4}(?:\s+\w+){1,3}\s+(?:Model|Edition|Version)\b/i, '')
    .replace(/\bBundle:?.*$/i, '') // Remove "Bundle: ..." suffix
    .replace(/\([^)]*\)/g, '') // Remove parentheses and their contents
    .trim();
  
  // Replace multiple spaces with single space
  processedTitle = processedTitle.replace(/\s{2,}/g, ' ');
  
  return processedTitle;
};
