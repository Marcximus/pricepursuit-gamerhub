
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions, DisabledOptions, FilterCategoryKey } from "../types";
import { matchesFilter } from "@/utils/laptop/filter/matchers";
import { useFilteredOptionsCache } from "./useFilteredOptionsCache";

/**
 * Optimized hook to calculate which filter options should be disabled
 * Uses indexing, memoization and fast Set operations for better performance
 */
export const useDisabledOptions = (
  filters: FilterOptions, 
  allLaptops: Product[],
  totalActiveFilters: number,
  processors: Set<string>,
  ramSizes: Set<string>,
  storageOptions: Set<string>,
  graphicsCards: Set<string>,
  screenSizes: Set<string>,
  brands: Set<string>
) => {
  // Get pre-filtered laptops for each category
  const filteredLaptopsByCategory = useFilteredOptionsCache(
    allLaptops, 
    filters, 
    totalActiveFilters
  );

  return useMemo(() => {
    // Fast return for empty state - no need to calculate disabled options
    if (totalActiveFilters === 0 || allLaptops.length === 0 || !filteredLaptopsByCategory) {
      return {
        brands: new Set<string>(),
        processors: new Set<string>(),
        ramSizes: new Set<string>(),
        storageOptions: new Set<string>(),
        graphicsCards: new Set<string>(),
        screenSizes: new Set<string>(),
      };
    }
    
    // Map categories to their field keys for fast lookups
    const categoryToField: Record<FilterCategoryKey, keyof Product> = {
      brands: 'brand',
      processors: 'processor',
      ramSizes: 'ram',
      storageOptions: 'storage',
      graphicsCards: 'graphics',
      screenSizes: 'screen_size'
    };
    
    // Map categories to option sets for faster lookup
    const categoryToOptions: Record<FilterCategoryKey, Set<string>> = {
      brands,
      processors,
      ramSizes,
      storageOptions,
      graphicsCards,
      screenSizes
    };
    
    // Create a function to efficiently find available options
    const findAvailableOptions = (
      category: FilterCategoryKey,
      laptops: Product[]
    ): Set<string> => {
      const field = categoryToField[category];
      const optionsSet = categoryToOptions[category];
      
      // Use Set for O(1) lookups
      const availableOptions = new Set<string>();
      
      // Create a Map to cache matches for better performance
      const optionMatchCache: Map<string, boolean> = new Map();
      
      // Check each option against the laptops
      for (const option of optionsSet) {
        // Use for-of loop with early break for better performance
        let isAvailable = false;
        
        for (const laptop of laptops) {
          const fieldValue = laptop[field];
          
          // Skip if the laptop doesn't have this field value
          if (!fieldValue) continue;
          
          // Create a cache key for this option-field combination
          const cacheKey = `${option}:${fieldValue}`;
          
          // Check if we already determined if this option matches this field value
          if (optionMatchCache.has(cacheKey)) {
            if (optionMatchCache.get(cacheKey)) {
              isAvailable = true;
              break;
            }
            continue;
          }
          
          // Calculate match and cache the result
          const matches = matchesFilter(option, fieldValue as string, field as any, laptop.title);
          optionMatchCache.set(cacheKey, matches);
          
          if (matches) {
            isAvailable = true;
            break;
          }
        }
        
        if (isAvailable) {
          availableOptions.add(option);
        }
      }
      
      return availableOptions;
    };
    
    // Calculate available options for each category
    const availableOptionsByCategory: Record<FilterCategoryKey, Set<string>> = {
      brands: findAvailableOptions('brands', filteredLaptopsByCategory.brands),
      processors: findAvailableOptions('processors', filteredLaptopsByCategory.processors),
      ramSizes: findAvailableOptions('ramSizes', filteredLaptopsByCategory.ramSizes),
      storageOptions: findAvailableOptions('storageOptions', filteredLaptopsByCategory.storageOptions),
      graphicsCards: findAvailableOptions('graphicsCards', filteredLaptopsByCategory.graphicsCards),
      screenSizes: findAvailableOptions('screenSizes', filteredLaptopsByCategory.screenSizes)
    };
    
    // Calculate disabled options (those not in available options)
    const disabledOptions: DisabledOptions = {
      brands: new Set<string>(),
      processors: new Set<string>(),
      ramSizes: new Set<string>(),
      storageOptions: new Set<string>(),
      graphicsCards: new Set<string>(),
      screenSizes: new Set<string>()
    };
    
    // Fill disabled options sets
    Object.keys(categoryToOptions).forEach((key) => {
      const category = key as FilterCategoryKey;
      const allOptions = categoryToOptions[category];
      const availableOptions = availableOptionsByCategory[category];
      
      // Only iterate through options that exist in the category
      for (const option of allOptions) {
        if (!availableOptions.has(option)) {
          disabledOptions[category].add(option);
        }
      }
    });
    
    return disabledOptions;
  }, [
    filteredLaptopsByCategory,
    totalActiveFilters,
    allLaptops.length,
    processors,
    ramSizes,
    storageOptions,
    graphicsCards,
    screenSizes,
    brands
  ]);
};
