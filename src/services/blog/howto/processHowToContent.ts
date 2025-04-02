
import { cleanupContent, fixHtmlTags, formatTables } from './contentProcessor';
import { addVideoEmbed, wrapTextInHtml } from './htmlGenerator';
import { getHowToPrompt } from '../../../supabase/functions/generate-blog-post/prompts/howToPrompt';

/**
 * Process How-To blog content to ensure proper formatting
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
          // If both methods fail, log the error and return the original content
          console.error('Failed to parse How-To content as JSON:', extractError);
          console.log('Content excerpt that failed parsing:', 
            extractedJson.substring(0, Math.min(300, extractedJson.length)));
        }
      }
    }
    
    // If we have a JSON object with content field, use that
    if (jsonContent && typeof jsonContent.content === 'string') {
      let processedContent = jsonContent.content;
      
      // Remove escaped newlines
      processedContent = processedContent
        .replace(/\\n\\n/g, '\n\n')
        .replace(/\\n/g, '\n');
      
      // Remove escaped quotes
      processedContent = processedContent
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
      
      // Apply HTML fixes and formatting
      processedContent = cleanupContent(processedContent);
      processedContent = fixHtmlTags(processedContent);
      processedContent = formatTables(processedContent);
      
      // Add video embed if needed
      processedContent = addVideoEmbed(processedContent);
      
      // Replace image placeholders with proper HTML
      processedContent = processedContent.replace(/Image (\d+)/g, (match, number) => {
        return `<div class="image-placeholder" id="image-${number}">
          <p class="placeholder-text">Click to upload image ${number}</p>
        </div>`;
      });
      
      return processedContent;
    }
  } catch (error) {
    console.log('Processing How-To content as plain text:', error);
  }
  
  // If not JSON or parsing failed, process as plain text
  let processedContent = cleanupContent(content);
  processedContent = fixHtmlTags(processedContent);
  processedContent = formatTables(processedContent);
  processedContent = addVideoEmbed(processedContent);
  
  // If no HTML tags found, wrap in basic HTML
  if (!processedContent.includes('<h1>') && !processedContent.includes('<p>')) {
    processedContent = wrapTextInHtml(processedContent, title);
  }
  
  return processedContent;
}

/**
 * Get the How-To prompt for AI generation
 */
export { getHowToPrompt };
