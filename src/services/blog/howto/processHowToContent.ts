
import { cleanupContent, fixHtmlTags, formatTables } from './contentProcessor';
import { addVideoEmbed, wrapTextInHtml } from './htmlGenerator';
import { formatFAQSections } from './formatters/faqFormatter';
import { formatStepByStepInstructions } from './formatters/stepsFormatter';
import { processJsonContent } from './processors/jsonProcessor';
import { replaceImagePlaceholders } from './utils/imagePlaceholder';
import { wrapContentInHtml } from './utils/htmlWrapper';

export function processHowToContent(content: string, title: string): string {
  if (!content) return '';
  
  // First check if the content is already in JSON format
  const jsonContent = processJsonContent(content);
  if (jsonContent) {
    let processedContent = jsonContent;
    
    // Apply HTML fixes and formatting
    processedContent = cleanupContent(processedContent);
    processedContent = fixHtmlTags(processedContent);
    processedContent = formatTables(processedContent);
    processedContent = addVideoEmbed(processedContent);
    
    // Replace image placeholders with proper HTML
    processedContent = replaceImagePlaceholders(processedContent);
    
    // Ensure the content has proper HTML structure
    if (!processedContent.includes('<p>')) {
      processedContent = wrapTextInHtml(processedContent, title);
    }
    
    // Format FAQ sections and step-by-step instructions
    processedContent = formatFAQSections(processedContent);
    processedContent = formatStepByStepInstructions(processedContent);
    
    // Finally wrap content in HTML container
    processedContent = wrapContentInHtml(processedContent);
    
    return processedContent;
  }
  
  // If not JSON or parsing failed, process as plain text
  let processedContent = cleanupContent(content);
  processedContent = fixHtmlTags(processedContent);
  
  // Ensure the content has proper HTML structure
  if (!processedContent.includes('<p>')) {
    processedContent = wrapTextInHtml(processedContent, title);
  }
  
  processedContent = formatTables(processedContent);
  processedContent = addVideoEmbed(processedContent);
  
  // Format FAQ sections and step-by-step instructions
  processedContent = formatFAQSections(processedContent);
  processedContent = formatStepByStepInstructions(processedContent);
  
  // Finally wrap content in HTML container
  processedContent = wrapContentInHtml(processedContent);
  
  return processedContent;
}
