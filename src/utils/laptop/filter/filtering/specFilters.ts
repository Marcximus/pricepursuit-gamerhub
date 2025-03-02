
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { matchesFilter } from "../matchers";
import { extractProcessorFromTitle } from "../extractors/processor/processorExtractor";
import { standardizeProcessorForFiltering } from "../extractors/processor/processorStandardizer";

// Cache for extracted processors
const processorCache = new Map<string, string>();
// Cache for standardized processors
const standardizedProcessorCache = new Map<string, string>();

/**
 * Apply processor filtering to a laptop with improved performance
 */
export const applyProcessorFilter = (
  laptop: Product,
  filters: FilterOptions
): boolean => {
  if (filters.processors.size === 0) {
    return true;
  }
  
  // Skip laptops without any processor info in title or specs
  if (!laptop.processor && !laptop.title) {
    return false;
  }
  
  // Use cached processor extraction if possible
  const cacheKey = `${laptop.id || ''}-${laptop.title || ''}-${laptop.processor || ''}`;
  let extractedProcessor = processorCache.get(cacheKey);
  
  if (!extractedProcessor) {
    extractedProcessor = extractProcessorFromTitle(laptop.title, laptop.processor);
    if (extractedProcessor) {
      processorCache.set(cacheKey, extractedProcessor);
    }
  }
  
  // If we can't determine the processor at all, exclude when processor filter is active
  if (!extractedProcessor) {
    return false;
  }
  
  // Get standardized processor from cache or compute it
  let standardizedProcessor = standardizedProcessorCache.get(extractedProcessor);
  if (!standardizedProcessor) {
    standardizedProcessor = standardizeProcessorForFiltering(extractedProcessor);
    standardizedProcessorCache.set(extractedProcessor, standardizedProcessor);
  }
  
  // Special handling for MacBooks with Apple Silicon in title
  if (laptop.title) {
    const normalizedTitle = laptop.title.toLowerCase();
    
    // Fast path for Apple silicon
    if (normalizedTitle.includes('macbook')) {
      // Process M-series chips for MacBooks
      for (const mVersion of ["m1", "m2", "m3", "m4"]) {
        if (normalizedTitle.includes(mVersion)) {
          // Check for variants (Pro, Max, Ultra)
          let variant = "";
          if (normalizedTitle.includes(`${mVersion} pro`)) variant = "Pro";
          else if (normalizedTitle.includes(`${mVersion} max`)) variant = "Max";
          else if (normalizedTitle.includes(`${mVersion} ultra`)) variant = "Ultra";
          
          // Check if any selected filter matches this Apple M-series
          const mVersionUpper = mVersion.charAt(0).toUpperCase() + mVersion.slice(1);
          const chipName = `Apple ${mVersionUpper}${variant ? ' ' + variant : ''}`;
          
          if (filters.processors.has(chipName)) {
            return true;
          }
        }
      }
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
