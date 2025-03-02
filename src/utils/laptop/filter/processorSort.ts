
import type { FilterOption } from "../../../components/laptops/filters/components/FilterOptionsList";

export const sortProcessorOptions = (options: FilterOption[]): FilterOption[] => {
  // Ensure options is an array to prevent runtime errors
  if (!options || !Array.isArray(options)) {
    console.warn('Invalid options provided to sortProcessorOptions');
    return [];
  }
  
  // Group processors by manufacturer
  const processorGroups: Record<string, FilterOption[]> = {
    'Apple': [],
    'Intel': [],
    'AMD': [],
    'Other': []
  };
  
  // Sort each processor into its manufacturer group
  options.forEach(option => {
    const name = option.name;
    if (name.includes('Apple') || name.includes('M1') || name.includes('M2') || name.includes('M3')) {
      processorGroups['Apple'].push(option);
    } else if (name.includes('Intel') || name.includes('Core')) {
      processorGroups['Intel'].push(option);
    } else if (name.includes('AMD') || name.includes('Ryzen')) {
      processorGroups['AMD'].push(option);
    } else {
      processorGroups['Other'].push(option);
    }
  });
  
  // Sort each group by performance
  for (const group in processorGroups) {
    processorGroups[group].sort((a, b) => {
      // Sort by enabled/disabled status first
      if (a.disabled !== b.disabled) {
        return a.disabled ? 1 : -1;
      }
      
      // Then sort by processor category
      const isHigherTierA = getProcessorTier(a.name);
      const isHigherTierB = getProcessorTier(b.name);
      
      return isHigherTierB - isHigherTierA;
    });
  }
  
  // Create ordered list with Apple first, then Intel, then AMD
  return [
    ...processorGroups['Apple'],
    ...processorGroups['Intel'],
    ...processorGroups['AMD'],
    ...processorGroups['Other']
  ];
};

// Helper function to get processor tier (higher number = higher performance)
function getProcessorTier(processor: string): number {
  // Higher-tier processors get higher values
  if (processor.includes('M3') || processor.includes('i9') || processor.includes('Ryzen 9')) {
    return 5;
  } else if (processor.includes('M2') || processor.includes('i7') || processor.includes('Ryzen 7')) {
    return 4;
  } else if (processor.includes('M1') || processor.includes('i5') || processor.includes('Ryzen 5')) {
    return 3;
  } else if (processor.includes('i3') || processor.includes('Ryzen 3')) {
    return 2;
  } else {
    return 1;
  }
}
