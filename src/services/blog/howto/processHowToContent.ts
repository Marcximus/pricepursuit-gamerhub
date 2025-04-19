
import { cleanupContent, fixHtmlTags, formatTables } from './contentProcessor';
import { addVideoEmbed } from './htmlGenerator';

/**
 * Process How-To blog content to ensure proper formatting
 * but preserve the original HTML structure from the AI
 */
export function processHowToContent(content: string, title: string): string {
  if (!content) return '';
  
  // First check if the content is already in JSON format
  try {
    // Check if the entire content is a JSON string
    let jsonContent;
    
    // First, clean up HTML tags like <br/> that might be embedded in the JSON
    const cleanedHtmlContent = content
      .replace(/<br\/>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/<[^>]*>/g, '');
    
    try {
      // Try to parse the cleaned content
      jsonContent = JSON.parse(cleanedHtmlContent);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON pattern
      const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = jsonMatch[0]
          .replace(/<br\/>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/<[^>]*>/g, '');
        
        try {
          jsonContent = JSON.parse(extractedJson);
        } catch (extractError) {
          console.error('Failed to parse How-To content as JSON:', extractError);
          
          // Try parsing with control characters removed
          try {
            const cleanedJson = extractedJson
              .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
              .replace(/\\u00([0-1][0-9a-fA-F])/g, '');
            jsonContent = JSON.parse(cleanedJson);
          } catch (cleaningError) {
            // If all parsing attempts fail, continue with other methods
            console.error('Failed to parse even after cleaning control characters');
          }
        }
      }
    }
    
    // If we have a JSON object with content field, use that
    if (jsonContent && typeof jsonContent.content === 'string') {
      let processedContent = jsonContent.content;
      
      // Remove escaped newlines and quotes - these cause rendering issues
      processedContent = processedContent
        .replace(/\\n\\n/g, '\n\n')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
      
      // Fix necessary HTML issues without overprocessing
      processedContent = fixHtmlTags(processedContent);
      
      // Add video embed if needed
      processedContent = addVideoEmbed(processedContent);
      
      // Replace image placeholders with proper HTML
      processedContent = processedContent.replace(/Image (\d+)/g, (match, number) => {
        return `<div class="image-placeholder" id="image-${number}">
          <p class="placeholder-text">Click to upload image ${number}</p>
        </div>`;
      });
      
      // Important: Preserve HTML structure from AI by not applying more processing
      return processedContent;
    }
  } catch (error) {
    console.log('Processing How-To content as plain text:', error);
  }
  
  // If not JSON or parsing failed, process as plain text with minimal formatting
  // Prioritize preserving HTML tags from the original content
  let processedContent = cleanupContent(content);
  processedContent = fixHtmlTags(processedContent);
  processedContent = formatTables(processedContent);
  processedContent = addVideoEmbed(processedContent);
  
  return processedContent;
}

/**
 * Get the How-To prompt for AI generation
 */
export { getHowToPrompt } from './howToPrompt';
