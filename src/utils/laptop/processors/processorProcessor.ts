import { 
  extractProcessor, 
  cleanProcessorText, 
  standardizeProcessor 
} from './extractors/processorExtractor';

/**
 * Processes and normalizes processor information from laptop data
 */
export const processProcessor = (
  processor: string | undefined, 
  title: string, 
  description?: string
): string | undefined => {
  // First try to use existing processor information if valid
  if (processor && typeof processor === 'string' && !processor.includes('undefined')) {
    // Clean up existing processor string to remove unrelated specs
    const cleanedProcessor = cleanProcessorText(processor);
    
    if (cleanedProcessor.length > 3 && 
        cleanedProcessor !== 'AMD' && 
        cleanedProcessor !== 'Intel') {
      return standardizeProcessor(cleanedProcessor);
    }
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Extract processor from the combined text
  const extractedProcessor = extractProcessor(textToSearch);
  
  if (extractedProcessor) {
    return standardizeProcessor(extractedProcessor);
  }
  
  // Return original processor if it can't be enhanced
  if (processor) {
    return processor;
  }
  
  return undefined;
};
