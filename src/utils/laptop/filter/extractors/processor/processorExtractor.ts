
import {
  extractIntelProcessor,
  extractAppleProcessor,
  enhanceAppleProcessor,
  extractAmdProcessor,
  extractMobileProcessor,
  extractGenericProcessor
} from './extractors';

/**
 * Extracts processor information from laptop title
 * First tries to find specific patterns, then falls back to general extraction
 */
export const extractProcessorFromTitle = (
  title: string | undefined,
  existingProcessor?: string | null
): string | null => {
  if (!title) return existingProcessor || null;
  
  const normalizedTitle = title.toLowerCase();
  
  // Special case for when the processor is just "Apple" in a MacBook context
  if (existingProcessor === 'Apple' && 
      (normalizedTitle.includes('macbook') || normalizedTitle.includes('mac book'))) {
    const enhancedApple = enhanceAppleProcessor(normalizedTitle);
    if (enhancedApple) return enhancedApple;
  }
  
  // Try each extractor in order of priority
  return extractAppleProcessor(normalizedTitle) ||
         extractIntelProcessor(normalizedTitle) ||
         extractAmdProcessor(normalizedTitle) ||
         extractMobileProcessor(normalizedTitle) ||
         extractGenericProcessor(normalizedTitle) ||
         existingProcessor || null;
};
