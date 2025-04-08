
/**
 * Specialized module for cleaning and formatting excerpts
 */

/**
 * Clean and format excerpt for better readability
 */
export function cleanExcerpt(excerpt: string): string {
  // Clean up any HTML or special characters in excerpt
  let cleanedExcerpt = excerpt
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim();
  
  // If excerpt ends abruptly, add ellipsis
  if (cleanedExcerpt.endsWith(',') || 
      cleanedExcerpt.endsWith('-') || 
      cleanedExcerpt.endsWith('–')) {
    cleanedExcerpt = cleanedExcerpt.slice(0, -1) + '...';
  }
  
  // Ensure excerpt doesn't exceed 200 characters (as specified in the prompt)
  if (cleanedExcerpt.length > 200) {
    cleanedExcerpt = cleanedExcerpt.substring(0, 197) + '...';
  }
  
  // Ensure excerpt has proper ending punctuation
  if (!cleanedExcerpt.endsWith('.') && 
      !cleanedExcerpt.endsWith('!') && 
      !cleanedExcerpt.endsWith('?') && 
      !cleanedExcerpt.endsWith('...')) {
    cleanedExcerpt += '.';
  }
  
  // Log excerpt length and sample for debugging
  console.log('📄 Final excerpt length:', cleanedExcerpt.length, 'characters');
  console.log('📄 Excerpt sample:', cleanedExcerpt.substring(0, 50) + '...');
  
  return cleanedExcerpt;
}
