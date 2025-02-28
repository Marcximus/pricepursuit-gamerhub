
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { matchesFilter } from "../matchers";

/**
 * Apply processor filtering to a laptop
 */
export const applyProcessorFilter = (
  laptop: Product,
  filters: FilterOptions
): boolean => {
  if (filters.processors.size === 0) {
    return true;
  }
  
  // Exclude laptops with unspecified processors when processor filter is active
  if (!laptop.processor) {
    return false;
  }
  
  return Array.from(filters.processors).some(selectedProcessor => 
    matchesFilter(selectedProcessor, laptop.processor, 'processor', laptop.title)
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
