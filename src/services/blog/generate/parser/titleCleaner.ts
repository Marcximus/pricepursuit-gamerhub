
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
  
  // First, check if the title value itself is a JSON string
  if (title.trim().startsWith('{') && title.trim().endsWith('}')) {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(title);
      if (parsed && parsed.title) {
        title = parsed.title;
        console.log('📝 Title extracted from JSON object:', title);
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
  
  // Handle HTML formatting issues (common with AI generations)
  let cleanedTitle = title
    // Remove any JSON format markers
    .replace(/^{.*?"title"[\s]*:[\s]*"(.*?)".*}$/i, '$1')
    // Handle HTML line breaks that might appear in the title
    .replace(/<br\s*\/?>/gi, ' ')
    // Handle escaped newlines
    .replace(/\\n/g, ' ')
    // Handle escaped quotes
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Trim any whitespace from ends
    .trim();
    
  // CRITICAL: Preserve internal spaces and don't modify them
  
  console.log('📝 Final cleaned title:', cleanedTitle);
  
  return cleanedTitle;
}
