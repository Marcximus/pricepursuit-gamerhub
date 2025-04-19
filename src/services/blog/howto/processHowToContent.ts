
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
    
    // Wrap content in HTML container
    processedContent = wrapContentInHtml(processedContent);
    
    // Format FAQ sections and step-by-step instructions
    processedContent = formatFAQSections(processedContent);
    processedContent = formatStepByStepInstructions(processedContent);
    
    return processedContent;
  }
  
  // If not JSON or parsing failed, process as plain text
  let processedContent = cleanupContent(content);
  processedContent = fixHtmlTags(processedContent);
  processedContent = formatTables(processedContent);
  processedContent = addVideoEmbed(processedContent);
  
  // Wrap content in HTML container
  processedContent = wrapContentInHtml(processedContent);
  
  // Format FAQ sections and step-by-step instructions
  processedContent = formatFAQSections(processedContent);
  processedContent = formatStepByStepInstructions(processedContent);
  
  // If no HTML tags found, wrap in basic HTML
  if (!processedContent.includes('<h1>') && !processedContent.includes('<p>')) {
    processedContent = wrapTextInHtml(processedContent, title);
  }
  
  return processedContent;
}
