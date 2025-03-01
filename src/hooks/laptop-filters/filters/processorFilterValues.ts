import type { Product } from "@/types/product";
import { standardizeProcessorForFiltering } from "@/utils/laptop/filter/extractors/processor/processorStandardizer";
import { extractProcessorFromTitle } from "@/utils/laptop/filter/extractors/processor/processorExtractor";

/**
 * Gets standardized processor categories for filtering with improved extraction
 */
export const getStandardizedProcessorValues = (laptops: Product[]): Set<string> => {
  const processorsSet = new Set<string>();
  const processorCounts: Record<string, number> = {};
  
  // First, process all laptops to extract and standardize their processors
  laptops.forEach(laptop => {
    // Extract processor from title with fallback to stored value 
    const extractedProcessor = extractProcessorFromTitle(laptop.title, laptop.processor);
    if (!extractedProcessor) return;
    
    // Get standardized category
    const standardized = standardizeProcessorForFiltering(extractedProcessor);
    
    // Count occurrences of each category
    processorCounts[standardized] = (processorCounts[standardized] || 0) + 1;
  });
  
  // Excluded generic Intel categories that are now redistributed to generation-specific ones
  const excludedCategories = [
    'Intel Core i9', 'Intel Core i7', 'Intel Core i5', 'Intel Core i3'
  ];
  
  // Primary processor categories - updated with consolidated Apple categories
  const primaryCategories = [
    // Apple - simplified to just the main M-series versions
    'Apple M4', 'Apple M3', 'Apple M2', 'Apple M1',
    
    // Intel Core Ultra
    'Intel Core Ultra 9', 'Intel Core Ultra 7', 'Intel Core Ultra 5',
    'Intel Core Ultra',
    
    // Intel Core simplified generations
    'Intel Core i9 (11th-14th Gen)', 'Intel Core i7 (11th-14th Gen)', 
    'Intel Core i5 (11th-14th Gen)', 'Intel Core i3 (11th-14th Gen)',
    
    'Intel Core i9 (8th-10th Gen)', 'Intel Core i7 (8th-10th Gen)', 
    'Intel Core i5 (8th-10th Gen)', 'Intel Core i3 (8th-10th Gen)',
    
    'Intel Core i7 (2nd-7th Gen)', 'Intel Core i5 (2nd-7th Gen)',
    'Intel Core i3 (2nd-7th Gen)',
    
    // AMD Ryzen
    'AMD Ryzen 9', 'AMD Ryzen 7', 'AMD Ryzen 5', 'AMD Ryzen 3',
    
    // Budget options
    'Intel Celeron', 'Intel Pentium',
    
    // Mobile processors
    'Qualcomm Snapdragon', 'MediaTek',
    
    // Other
    'Other Processor'
  ];
  
  // Add categories with at least one matching laptop
  primaryCategories.forEach(category => {
    // Skip excluded categories (generic Intel Core)
    if (excludedCategories.includes(category)) {
      return;
    }
    
    if (processorCounts[category] && processorCounts[category] > 0) {
      processorsSet.add(category);
    }
  });
  
  // Always ensure "Other Processor" is available if there are laptops 
  // that don't match a standard category
  if (processorCounts['Other Processor'] && processorCounts['Other Processor'] > 0) {
    processorsSet.add('Other Processor');
  }
  
  // Log processor category distribution for debugging
  console.log('Processor category distribution:', processorCounts);
  
  return processorsSet;
};
