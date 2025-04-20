
import { cleanupContent, fixHtmlTags, formatTables } from '../contentProcessor';
import { addVideoEmbed, wrapTextInHtml } from '../htmlGenerator';
import { formatFAQSections } from '../formatters/faqFormatter';
import { formatStepByStepInstructions } from '../formatters/stepsFormatter';
import { distributeImagesBeforeSections } from '../utils/imagePlaceholder';
import { wrapContentInHtml } from '../utils/htmlWrapper';

export function processPlainText(content: string, title: string): string {
  let processedContent = cleanupContent(content);
  processedContent = fixHtmlTags(processedContent);
  processedContent = formatTables(processedContent);
  processedContent = addVideoEmbed(processedContent);
  
  // Format FAQ sections and step-by-step instructions
  processedContent = formatFAQSections(processedContent);
  processedContent = formatStepByStepInstructions(processedContent);
  
  // Distribute images evenly before section breaks
  processedContent = distributeImagesBeforeSections(processedContent, 5);
  
  // Wrap content in HTML container
  processedContent = wrapContentInHtml(processedContent);
  
  // If no HTML tags found, wrap in basic HTML
  if (!processedContent.includes('<h1>') && !processedContent.includes('<p>')) {
    processedContent = wrapTextInHtml(processedContent, title);
  }
  
  return processedContent;
}
