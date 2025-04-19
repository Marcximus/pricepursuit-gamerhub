
/**
 * Specialized module for cleaning and formatting titles
 */

/**
 * Clean and format title for better readability and URL compatibility
 */
export function cleanTitle(title: string): string {
  console.log('📝 Original title before cleaning:', title);
  
  // If title is null or undefined, return empty string
  if (!title) return '';
  
  // First, check if the entire title is part of a JSON object
  if (title.trim().startsWith('{') && title.trim().endsWith('}')) {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(title);
      if (parsed && parsed.title) {
        title = parsed.title;
        console.log('📝 Title extracted from JSON:', title);
      }
    } catch (e) {
      console.warn('⚠️ Title looks like JSON but failed to parse:', e);
      
      // If JSON parsing fails, try to extract title using regex
      const titleMatch = title.match(/"title"\s*:\s*"([^"]*)(?:"|$)/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1];
        console.log('📝 Title extracted using regex:', title);
      }
    }
  }
  
  // Clean up any HTML or special characters in title
  let cleanedTitle = title
    // Remove any JSON format markers
    .replace(/^{.*?"title"[\s]*:[\s]*"(.*?)".*}$/i, '$1')
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim();
  
  console.log('📝 Final cleaned title:', cleanedTitle);
  
  return cleanedTitle;
}
