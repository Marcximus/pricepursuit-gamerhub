
import { matchesAppleMSeriesPattern, containsAppleProcessorName } from './patterns/applePatterns';
import { 
  matchesIntelCoreWithGeneration, 
  matchesIntelCoreSeries,
  matchesIntelCeleron, 
  matchesIntelPentium,
  matchesIntelCoreUltra,
  containsIntelProcessorName
} from './patterns/intelPatterns';
import { matchesAmdRyzenPattern, containsAmdProcessorName } from './patterns/amdPatterns';
import { 
  containsMainProcessorCategory,
  containsMobileProcessorName
} from './patterns/commonPatterns';

/**
 * Checks if a processor belongs to any of the main processor categories
 * Used by the "Other Processor" matcher
 */
export const isMainCategoryProcessor = (
  processorValue: string | null | undefined, 
  title?: string
): boolean => {
  if (!processorValue && !title) return false;
  
  // First prioritize checking the title
  if (title) {
    // Apple patterns
    if (matchesAppleMSeriesPattern(title) || containsAppleProcessorName(title)) {
      return true;
    }
    
    // Intel patterns
    if (matchesIntelCoreWithGeneration(title) || 
        matchesIntelCoreSeries(title) ||
        matchesIntelCeleron(title) ||
        matchesIntelPentium(title) ||
        matchesIntelCoreUltra(title) ||
        containsIntelProcessorName(title)) {
      return true;
    }
    
    // AMD patterns
    if (matchesAmdRyzenPattern(title) || containsAmdProcessorName(title)) {
      return true;
    }
    
    // Common pattern checks
    if (containsMainProcessorCategory(title) || containsMobileProcessorName(title)) {
      return true;
    }
    
    // Special case for MacBook with just "Apple" processor
    if (title.toLowerCase().includes('macbook') && processorValue === 'Apple') {
      return true;
    }
  }
  
  // Fall back to checking the processor value
  if (processorValue) {
    // Apple patterns
    if (matchesAppleMSeriesPattern(processorValue) || containsAppleProcessorName(processorValue)) {
      return true;
    }
    
    // Intel patterns
    if (matchesIntelCoreWithGeneration(processorValue) || 
        matchesIntelCoreSeries(processorValue) ||
        matchesIntelCeleron(processorValue) ||
        matchesIntelPentium(processorValue) ||
        matchesIntelCoreUltra(processorValue) ||
        containsIntelProcessorName(processorValue)) {
      return true;
    }
    
    // AMD patterns
    if (matchesAmdRyzenPattern(processorValue) || containsAmdProcessorName(processorValue)) {
      return true;
    }
    
    // Common pattern checks
    if (containsMainProcessorCategory(processorValue) || containsMobileProcessorName(processorValue)) {
      return true;
    }
  }
  
  return false;
};
