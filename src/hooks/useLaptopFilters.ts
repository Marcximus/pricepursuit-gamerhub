
import { useMemo, useCallback } from "react";
import type { Product } from "@/types/product";
import { getUniqueFilterValues, getGroupedBrandValues } from "./laptop-filters";

// Global cache for filter options by laptop count
const filterOptionsCache = new Map<number, any>();

/**
 * Hook for generating laptop filter options based on available laptop data
 * With improved performance and caching
 */
export const useLaptopFilters = (laptops: Product[] | undefined) => {
  // Unique key based on laptop count to use for caching
  const cacheKey = laptops?.length || 0;
  
  // Memoized callback for generating filter options
  const generateFilterOptions = useCallback((laptopsData: Product[]) => {
    console.log('Generating filter options for', laptopsData.length, 'laptops');
    
    // Get storage options with optimized performance
    const storageOptions = getUniqueFilterValues(laptopsData, 'storage');
    
    return {
      // Use grouped brands instead of all individual brands for better performance
      brands: getGroupedBrandValues(laptopsData, 15),
      processors: getUniqueFilterValues(laptopsData, 'processor'),
      ramSizes: getUniqueFilterValues(laptopsData, 'ram'),
      storageOptions,
      graphicsCards: getUniqueFilterValues(laptopsData, 'graphics'),
      screenSizes: getUniqueFilterValues(laptopsData, 'screen_size'),
    };
  }, []);
  
  return useMemo(() => {
    // Return empty sets if no data
    if (!laptops || laptops.length === 0) {
      console.log('No laptops available for generating filter options');
      return {
        brands: new Set<string>(),
        processors: new Set<string>(),
        ramSizes: new Set<string>(),
        storageOptions: new Set<string>(),
        graphicsCards: new Set<string>(),
        screenSizes: new Set<string>(),
      };
    }
    
    // Check if we have cached this result
    if (filterOptionsCache.has(cacheKey)) {
      return filterOptionsCache.get(cacheKey);
    }
    
    // Generate new options
    const options = generateFilterOptions(laptops);
    
    // Cache the result for future use
    filterOptionsCache.set(cacheKey, options);
    
    return options;
  }, [laptops, cacheKey, generateFilterOptions]);
};
