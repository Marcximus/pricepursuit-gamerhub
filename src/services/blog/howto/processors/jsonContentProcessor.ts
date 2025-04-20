
import { cleanupContent, fixHtmlTags, formatTables } from '../contentProcessor';
import { addVideoEmbed } from '../htmlGenerator';
import { formatFAQSections } from '../formatters/faqFormatter';
import { formatStepByStepInstructions } from '../formatters/stepsFormatter';
import { replaceImagePlaceholders, distributeImagesBeforeSections } from '../utils/imagePlaceholder';
import { wrapContentInHtml } from '../utils/htmlWrapper';

export function processJsonContent(jsonContent: string): string {
  let processedContent = jsonContent;
  
  // Apply HTML fixes and formatting
  processedContent = cleanupContent(processedContent);
  processedContent = fixHtmlTags(processedContent);
  processedContent = formatTables(processedContent);
  processedContent = addVideoEmbed(processedContent);
  
  // Replace image placeholders with proper HTML
  processedContent = replaceImagePlaceholders(processedContent);
  
  // Format FAQ sections and step-by-step instructions
  processedContent = formatFAQSections(processedContent);
  processedContent = formatStepByStepInstructions(processedContent);
  
  // Distribute images evenly before section breaks (after formatting sections)
  processedContent = distributeImagesBeforeSections(processedContent, 5);
  
  // Wrap content in HTML container
  processedContent = wrapContentInHtml(processedContent);
  
  return processedContent;
}
