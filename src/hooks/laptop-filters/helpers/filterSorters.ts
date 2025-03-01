
import { getProcessorValue } from "@/utils/laptop/scoring/processor";
import { getGraphicsValue } from "@/utils/laptop/scoring/graphics";
import { getRamValue, getStorageValue, getScreenSizeValue } from "@/utils/laptop/valueParser";

/**
 * Sorts RAM options by capacity (descending)
 */
export const sortRamOptions = (values: string[]): string[] => {
  return [...values].sort((a, b) => getRamValue(b) - getRamValue(a));
};

/**
 * Sorts storage options by capacity (descending)
 */
export const sortStorageOptions = (values: string[]): string[] => {
  return [...values].sort((a, b) => getStorageValue(b) - getStorageValue(a));
};

/**
 * Sorts screen size options by diagonal size (descending)
 */
export const sortScreenSizeOptions = (values: string[]): string[] => {
  return [...values].sort((a, b) => getScreenSizeValue(b) - getScreenSizeValue(a));
};

/**
 * Sorts processors by manufacturer and performance (descending)
 */
export const sortProcessorOptions = (values: string[]): string[] => {
  // Group processors by manufacturer
  const processorGroups: Record<string, string[]> = {
    'Apple': [],
    'Intel': [],
    'AMD': [],
    'Other': []
  };
  
  // Sort each processor into its manufacturer group
  values.forEach(proc => {
    if (proc.includes('Apple') || proc.includes('M1') || proc.includes('M2') || proc.includes('M3')) {
      processorGroups['Apple'].push(proc);
    } else if (proc.includes('Intel')) {
      processorGroups['Intel'].push(proc);
    } else if (proc.includes('AMD') || proc.includes('Ryzen')) {
      processorGroups['AMD'].push(proc);
    } else {
      processorGroups['Other'].push(proc);
    }
  });
  
  // Sort each group by performance
  for (const group in processorGroups) {
    processorGroups[group].sort((a, b) => getProcessorValue(b) - getProcessorValue(a));
  }
  
  // Create ordered list with Apple first, then Intel, then AMD
  return [
    ...processorGroups['Apple'],
    ...processorGroups['Intel'],
    ...processorGroups['AMD'],
    ...processorGroups['Other']
  ];
};

/**
 * Sorts graphics cards by manufacturer and performance (descending)
 */
export const sortGraphicsOptions = (values: string[]): string[] => {
  // Group graphics by manufacturer
  const graphicsGroups: Record<string, string[]> = {
    'NVIDIA': [],
    'AMD': [],
    'Intel': [],
    'Apple': [],
    'Other': []
  };
  
  // Sort each GPU into its manufacturer group
  values.forEach(gpu => {
    if (gpu.includes('NVIDIA') || gpu.includes('RTX') || gpu.includes('GTX')) {
      graphicsGroups['NVIDIA'].push(gpu);
    } else if (gpu.includes('AMD') || gpu.includes('Radeon')) {
      graphicsGroups['AMD'].push(gpu);
    } else if (gpu.includes('Intel')) {
      graphicsGroups['Intel'].push(gpu);
    } else if (gpu.includes('Apple') || gpu.includes('M1') || gpu.includes('M2') || gpu.includes('M3')) {
      graphicsGroups['Apple'].push(gpu);
    } else {
      graphicsGroups['Other'].push(gpu);
    }
  });
  
  // Sort each group by performance
  for (const group in graphicsGroups) {
    graphicsGroups[group].sort((a, b) => getGraphicsValue(b) - getGraphicsValue(a));
  }
  
  // Create ordered list with dedicated GPUs first
  return [
    ...graphicsGroups['NVIDIA'],
    ...graphicsGroups['AMD'],
    ...graphicsGroups['Apple'],
    ...graphicsGroups['Intel'],
    ...graphicsGroups['Other']
  ];
};

/**
 * Sorts brands by popularity/market share with major brands first
 */
export const sortBrandOptions = (values: string[]): string[] => {
  // Brand order by popularity/market share
  const brandOrder: Record<string, number> = {
    'Apple': 1,
    'Dell': 2,
    'HP': 3,
    'Lenovo': 4,
    'ASUS': 5,
    'Acer': 6,
    'MSI': 7,
    'Samsung': 8,
    'Microsoft': 9,
    'Razer': 10,
    'Alienware': 11,
    'LG': 12
  };
  
  return [...values].sort((a, b) => {
    const orderA = brandOrder[a] || 100;
    const orderB = brandOrder[b] || 100;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.localeCompare(b);
  });
};

/**
 * Default alphabetical sorter for any other filter types
 */
export const sortDefaultOptions = (values: string[]): string[] => {
  return [...values].sort((a, b) => a.localeCompare(b));
};

/**
 * Mapping of filter types to their sorting functions
 */
export const sorterMap = {
  'ram': sortRamOptions,
  'storage': sortStorageOptions,
  'screen_size': sortScreenSizeOptions,
  'processor': sortProcessorOptions,
  'graphics': sortGraphicsOptions,
  'brand': sortBrandOptions
};
