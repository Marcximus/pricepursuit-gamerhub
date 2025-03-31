
import { cleanupContent, fixHtmlTags, formatTables } from './contentProcessor';
import { addVideoEmbed, wrapTextInHtml } from './htmlGenerator';
import { getHowToPrompt } from './howToPrompt';

/**
 * Process How-To blog content to ensure proper formatting
 */
export function processHowToContent(content: string, title: string): string {
  if (!content) return '';
  
  // First check if the content is already in JSON format
  try {
    const jsonContent = JSON.parse(content);
    
    // If we have a JSON object with content field, use that
    if (jsonContent && typeof jsonContent.content === 'string') {
      let processedContent = jsonContent.content;
      
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
    console.log('Content is not in JSON format, processing as plain text');
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
