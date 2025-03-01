
import { 
  detectAppleSilicon,
  detectIntelCoreUltra,
  detectIntelCore,
  detectAMDRyzen,
  detectBudgetProcessors,
  detectMobileProcessors
} from './processorDetectors';

/**
 * Standardizes processor information into categories for filtering
 */
export const standardizeProcessorForFiltering = (processor: string | null | undefined): string => {
  if (!processor) return 'Other Processor';
  
  const normalizedProcessor = processor.toLowerCase();
  
  // Try each detector in sequence
  
  // Check for Apple Silicon first
  const appleSiliconResult = detectAppleSilicon(normalizedProcessor);
  if (appleSiliconResult) return appleSiliconResult;
  
  // Check for Intel Core Ultra
  const intelCoreUltraResult = detectIntelCoreUltra(normalizedProcessor);
  if (intelCoreUltraResult) return intelCoreUltraResult;
  
  // Check for Intel Core i-series
  const intelCoreResult = detectIntelCore(normalizedProcessor);
  if (intelCoreResult) return intelCoreResult;
  
  // Check for AMD Ryzen
  const amdRyzenResult = detectAMDRyzen(normalizedProcessor);
  if (amdRyzenResult) return amdRyzenResult;
  
  // Check for budget processors
  const budgetProcessorResult = detectBudgetProcessors(normalizedProcessor);
  if (budgetProcessorResult) return budgetProcessorResult;
  
  // Check for mobile processors
  const mobileProcessorResult = detectMobileProcessors(normalizedProcessor);
  if (mobileProcessorResult) return mobileProcessorResult;
  
  // If we can't categorize it, mark it as "Other"
  return 'Other Processor';
};
