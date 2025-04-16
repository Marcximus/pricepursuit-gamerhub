
/**
 * Specialized module for cleaning and formatting excerpts
 */

/**
 * Clean and format excerpt for better readability
 */
export function cleanExcerpt(excerpt: string): string {
  console.log('📄 Original excerpt before cleaning:', excerpt);
  
  // If excerpt is null or undefined, return empty string
  if (!excerpt) return '';
  
  // First, check if the entire excerpt is part of a JSON object
  if (excerpt.trim().startsWith('{') && excerpt.trim().endsWith('}')) {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(excerpt);
      if (parsed && parsed.excerpt) {
        excerpt = parsed.excerpt;
        console.log('📄 Excerpt extracted from JSON:', excerpt);
      }
    } catch (e) {
      console.warn('⚠️ Excerpt looks like JSON but failed to parse:', e);
      
      // If JSON parsing fails, try to extract excerpt using regex
      const excerptMatch = excerpt.match(/"excerpt"\s*:\s*"([^"]*)(?:"|$)/);
      if (excerptMatch && excerptMatch[1]) {
        excerpt = excerptMatch[1];
        console.log('📄 Excerpt extracted using regex:', excerpt);
      }
    }
  }
  
  // Clean up any HTML or special characters in excerpt
  let cleanedExcerpt = excerpt
    // Remove any JSON format markers
    .replace(/^{.*?"excerpt"[\s]*:[\s]*"(.*?)".*}$/i, '$1')
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
