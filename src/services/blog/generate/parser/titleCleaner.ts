
/**
 * Specialized module for cleaning and formatting titles
 */

/**
 * Clean title from any JSON or HTML formatting
 */
export function cleanTitle(title: string): string {
  // If title is empty, return empty string
  if (!title) return '';
  
  // Log the original title for debugging
  console.log('📄 Original title before cleaning:', title);
  
  // First, check if the entire title is a JSON object
  if (title.trim().startsWith('{') && title.trim().endsWith('}')) {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(title);
      if (parsed && parsed.title) {
        title = parsed.title;
        console.log('📄 Title extracted from JSON:', title);
      }
    } catch (e) {
      console.warn('⚠️ Title looks like JSON but failed to parse:', e);
      
      // Try to extract title using regex
      const titleMatch = title.match(/"title"\s*:\s*"([^"]*)(?:"|$)/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1];
        console.log('📄 Title extracted using regex:', title);
      }
    }
  }
  
  // Apply standard cleaning steps
  const cleanedTitle = title
    // Handle JSON format: {"title": "Actual Title"} or variations
    .replace(/^{.*?"title"[\s]*:[\s]*"(.*?)".*}$/i, '$1')
    // Handle HTML line breaks
    .replace(/<br\/>/g, '')
    // Handle escaped newlines
    .replace(/\\n/g, ' ')
    // Handle escaped quotes
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    .trim();
  
  console.log('📄 Title after cleaning:', cleanedTitle);
  return cleanedTitle;
}
