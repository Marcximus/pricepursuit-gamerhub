
/**
 * Functions for extracting specific components from generated content
 */

/**
 * Extract title, excerpt, and tags from content using regex
 */
export function extractContentComponents(content: string) {
  // Define regex patterns to extract components
  const titleRegex = /^#\s*(.*?)$|^Title:\s*(.*?)$|^"title":\s*"(.*?)"/im;
  const excerptRegex = /^Excerpt:\s*([\s\S]*?)(?=\n\n)|^"excerpt":\s*"([\s\S]*?)"/im;
  const tagsRegex = /^Tags:\s*(.*?)$|^"tags":\s*\[(.*?)\]/im;
  
  // Extract title
  let extractedTitle = '';
  const titleMatch = content.match(titleRegex);
  if (titleMatch) {
    extractedTitle = (titleMatch[1] || titleMatch[2] || titleMatch[3] || '').trim();
  }
  
  // Extract excerpt
  let extractedExcerpt = '';
  const excerptMatch = content.match(excerptRegex);
  if (excerptMatch) {
    extractedExcerpt = (excerptMatch[1] || excerptMatch[2] || '').trim();
  }
  
  // Extract tags
  let extractedTags: string[] = [];
  const tagsMatch = content.match(tagsRegex);
  if (tagsMatch) {
    const tagsString = (tagsMatch[1] || tagsMatch[2] || '').trim();
    if (tagsString.includes('"') || tagsString.includes("'")) {
      // Handle JSON format tags
      console.log(`🏷️ Detected JSON-formatted tags`);
      try {
        extractedTags = JSON.parse(`[${tagsString}]`);
      } catch (e) {
        try {
          // Try to fix common issues with JSON tags format
          const fixedString = tagsString
            .replace(/'/g, '"')  // Replace single quotes with double quotes
            .replace(/,\s*$/, ''); // Remove trailing commas
          extractedTags = JSON.parse(`[${fixedString}]`);
        } catch (e2) {
          // If still failing, fallback to simple splitting
          extractedTags = tagsString.split(/,\s*/);
        }
      }
    } else {
      extractedTags = tagsString.split(/,\s*/);
    }
  }
  
  return { extractedTitle, extractedExcerpt, extractedTags };
}
