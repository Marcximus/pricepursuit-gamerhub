
import { standardizeProcessorForFiltering } from './processorStandardizerCore';

/**
 * Get a simplified version of the processor for filtering purposes
 */
export const getProcessorFilterValue = (processor: string): string => {
  return standardizeProcessorForFiltering(processor);
};
