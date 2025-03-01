import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { matchesFilter } from "../matchers";
import { extractProcessorFromTitle } from "../extractors/processor/processorExtractor";
import { standardizeProcessorForFiltering } from "../extractors/processor/processorStandardizer";

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
  // This prioritizes title-based processor information
  const extractedProcessor = extractProcessorFromTitle(laptop.title, laptop.processor);
  
  // If we can't determine the processor at all, exclude when processor filter is active
  if (!extractedProcessor) {
    return false;
  }
  
  // Log for debugging to see what processors are being extracted and standardized
  const standardizedProcessor = standardizeProcessorForFiltering(extractedProcessor);
  
  // Special handling for MacBooks with Apple Silicon in title
  if (laptop.title) {
    const normalizedTitle = laptop.title.toLowerCase();
    
    if (normalizedTitle.includes('macbook') && normalizedTitle.includes('m2')) {
      // MacBook with M2 chip mentioned in title
      if (Array.from(filters.processors).some(filter => 
          filter === 'Apple M2' || 
          filter.startsWith('Apple M2 '))) {
        return true;
      }
    }
    
    // Special handling for Apple M-series in title - direct title check
    if (laptop.title.match(/\bm[1234]\s+chip\b/i)) {
      const mVersion = laptop.title.match(/\bm([1234])\s+chip\b/i)?.[1];
      if (mVersion) {
        // Check if any selected filter matches this Apple M-series
        if (Array.from(filters.processors).some(filter => 
            filter === `Apple M${mVersion}` || 
            filter.startsWith(`Apple M${mVersion} `))) {
          return true;
        }
      }
    }
  }
  
  // Special handling for processor value "Apple" with MacBook in title
  if (laptop.processor === 'Apple' && laptop.title && 
      laptop.title.toLowerCase().includes('macbook') && 
      laptop.title.toLowerCase().includes('m2')) {
    if (Array.from(filters.processors).some(filter => filter === 'Apple M2')) {
      return true;
    }
  }
  
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
