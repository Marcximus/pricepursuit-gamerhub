
/**
 * Content processing utilities for Top10 blog posts
 */
import { cleanupContent } from './contentCleaner';
import { fixHtmlTags } from './htmlFixer';
import { replaceProductPlaceholders, removeDuplicateProductBlocks } from './product/productPlacer';

/**
 * Clean up JSON formatting in content
 */
export function removeJsonFormatting(content: string): string {
  // Remove JSON markers and extract actual content if needed
  let cleanedContent = content;
  
  // Remove ```json blocks
  cleanedContent = cleanedContent.replace(/```json\s*\{/g, '');
  cleanedContent = cleanedContent.replace(/\}\s*```/g, '');
  
  // If content looks like a JSON object, try to extract the real content
  if (cleanedContent.trim().startsWith('{') && 
      (cleanedContent.includes('"content":') || cleanedContent.includes('"title":'))) {
    try {
      const jsonObj = JSON.parse(cleanedContent);
      if (jsonObj.content) {
        // We found a content field, use that as the actual content
        cleanedContent = jsonObj.content;
      }
    } catch (e) {
      console.warn('⚠️ Error parsing potential JSON content:', e);
      
      // Fallback: try to extract content using regex if JSON parsing fails
      const contentMatch = cleanedContent.match(/"content"\s*:\s*"((?:\\"|[^"])*?)"/);
      if (contentMatch && contentMatch[1]) {
        // Replace escaped quotes and newlines
        cleanedContent = contentMatch[1]
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\\\/g, '\\');
      }
    }
  }
  
  // Clean up any remaining JSON properties in the content
  cleanedContent = cleanedContent.replace(/"title"\s*:\s*".*?",?/g, '');
  cleanedContent = cleanedContent.replace(/"content"\s*:\s*"/g, '');
  cleanedContent = cleanedContent.replace(/"excerpt"\s*:\s*".*?",?/g, '');
  cleanedContent = cleanedContent.replace(/"tags"\s*:\s*\[.*?\],?/g, '');
  cleanedContent = cleanedContent.replace(/,\s*"excerpt"\s*:\s*".*?"/g, '');
  cleanedContent = cleanedContent.replace(/,\s*"tags"\s*:\s*\[.*?\]/g, '');
  cleanedContent = cleanedContent.replace(/"\s*$/g, '');
  
  return cleanedContent;
}

export {
  cleanupContent,
  fixHtmlTags,
  replaceProductPlaceholders,
  removeDuplicateProductBlocks
  // removeJsonFormatting is already exported directly above
};
