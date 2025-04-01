
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
    // Check if the entire content is a JSON string
    let jsonContent;
    
    // Handle cases where content includes HTML tags like <br/>
    if (content.includes('<br/>') || content.includes('&quot;')) {
      const cleanedContent = content
        .replace(/<br\/>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/<[^>]*>/g, '');
        
      try {
        jsonContent = JSON.parse(cleanedContent);
      } catch (e) {
        // If cleaning and parsing fails, try to extract JSON with regex
        const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0].replace(/<br\/>/g, '').replace(/<[^>]*>/g, '');
          jsonContent = JSON.parse(extractedJson);
        }
      }
    } else {
      // Try direct parsing if no HTML tags
      jsonContent = JSON.parse(content);
    }
    
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
