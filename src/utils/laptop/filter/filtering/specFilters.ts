
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { matchesFilter } from "../matchers";
import { extractProcessorFromTitle, standardizeProcessorForFiltering } from "../extractors/processorExtractor";

/**
 * Apply processor filtering to a laptop with improved title extraction
 */
export const applyProcessorFilter = (
  laptop: Product,
  filters: FilterOptions
): boolean => {
  if (filters.processors.size === 0) {
    return true;
  }
  
  // First extract processor from title with fallback to stored value
  const extractedProcessor = extractProcessorFromTitle(laptop.title, laptop.processor);
  
  // If we can't determine the processor at all, exclude when processor filter is active
  if (!extractedProcessor) {
    return false;
  }
  
  // Get standardized processor category
  const standardizedProcessor = standardizeProcessorForFiltering(extractedProcessor);
  
  // Try direct match with standardized category first (most efficient)
  if (filters.processors.has(standardizedProcessor)) {
    return true;
  }
  
  // If that fails, use the more detailed matcher logic that handles variations
  return Array.from(filters.processors).some(selectedProcessor => 
    matchesFilter(selectedProcessor, extractedProcessor, 'processor', laptop.title)
  );
};

/**
 * Apply RAM filtering to a laptop
 */
export const applyRamFilter = (
  laptop: Product,
  filters: FilterOptions
): boolean => {
  if (filters.ramSizes.size === 0) {
    return true;
  }
  
  // Exclude laptops with unspecified RAM when RAM filter is active
  if (!laptop.ram) {
    return false;
  }
  
  return Array.from(filters.ramSizes).some(selectedRam => 
    matchesFilter(selectedRam, laptop.ram, 'ram', laptop.title)
  );
};

/**
 * Apply storage filtering to a laptop
 */
export const applyStorageFilter = (
  laptop: Product,
  filters: FilterOptions
): boolean => {
  if (filters.storageOptions.size === 0) {
    return true;
  }
  
  // Exclude laptops with unspecified storage when storage filter is active
  if (!laptop.storage) {
    return false;
  }
  
  return Array.from(filters.storageOptions).some(selectedStorage => 
    matchesFilter(selectedStorage, laptop.storage, 'storage', laptop.title)
  );
};

/**
 * Apply graphics card filtering to a laptop
 */
export const applyGraphicsFilter = (
  laptop: Product,
  filters: FilterOptions
): boolean => {
  if (filters.graphicsCards.size === 0) {
    return true;
  }
  
  // Exclude laptops with unspecified graphics when graphics filter is active
  if (!laptop.graphics) {
    return false;
  }
  
  return Array.from(filters.graphicsCards).some(selectedGraphics => 
    matchesFilter(selectedGraphics, laptop.graphics, 'graphics', laptop.title)
  );
};

/**
 * Apply screen size filtering to a laptop
 */
export const applyScreenSizeFilter = (
  laptop: Product,
  filters: FilterOptions
): boolean => {
  if (filters.screenSizes.size === 0) {
    return true;
  }
  
  // Exclude laptops with unspecified screen size when screen size filter is active
  if (!laptop.screen_size) {
    return false;
  }
  
  return Array.from(filters.screenSizes).some(selectedSize => 
    matchesFilter(selectedSize, laptop.screen_size, 'screen_size', laptop.title)
  );
};

