
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions, FilterCategoryKey } from "../types";
import { matchesFilter } from "@/utils/laptop/filter/matchers";

/**
 * Efficient cache for computing available options based on current filters
 * With improved performance through better memoization and early returns
 */
export const useFilteredOptionsCache = (
  allLaptops: Product[],
  filters: FilterOptions,
  totalActiveFilters: number
) => {
  return useMemo(() => {
    // Skip calculation if no filters active or no laptops
    if (totalActiveFilters === 0 || allLaptops.length === 0) {
      return null;
    }

    // Create a map of filtered laptops for each category
    const categoryFilters: Record<FilterCategoryKey, Product[]> = {
      brands: [],
      processors: [],
      ramSizes: [],
      storageOptions: [],
      graphicsCards: [],
      screenSizes: []
    };

    // Use an efficient field-to-value map for faster lookups
    const laptopValueCache = new Map<string, Map<string, Product[]>>();
    
    // Pre-index laptops by their field values for faster filtering
    const indexLaptops = () => {
      const fieldKeys: Array<[FilterCategoryKey, keyof Product]> = [
        ['brands', 'brand'],
        ['processors', 'processor'],
        ['ramSizes', 'ram'],
        ['storageOptions', 'storage'],
        ['graphicsCards', 'graphics'],
        ['screenSizes', 'screen_size']
      ];
      
      fieldKeys.forEach(([category, field]) => {
        const fieldMap = new Map<string, Product[]>();
        
        allLaptops.forEach(laptop => {
          const fieldValue = laptop[field];
          if (fieldValue) {
            const normalizedValue = String(fieldValue).toLowerCase();
            if (!fieldMap.has(normalizedValue)) {
              fieldMap.set(normalizedValue, []);
            }
            fieldMap.get(normalizedValue)?.push(laptop);
          }
        });
        
        laptopValueCache.set(category, fieldMap);
      });
    };
    
    // Build index for faster lookups
    indexLaptops();

    // For each category, create a filtered set of laptops that match all OTHER filters
    Object.keys(categoryFilters).forEach((categoryKey) => {
      const category = categoryKey as FilterCategoryKey;
      
      // Create test filters without the current category
      const testFilters = { ...filters };
      
      // Clear the category we're testing
      if (category === 'brands') testFilters.brands = new Set<string>();
      else if (category === 'processors') testFilters.processors = new Set<string>();
      else if (category === 'ramSizes') testFilters.ramSizes = new Set<string>();
      else if (category === 'storageOptions') testFilters.storageOptions = new Set<string>();
      else if (category === 'graphicsCards') testFilters.graphicsCards = new Set<string>();
      else if (category === 'screenSizes') testFilters.screenSizes = new Set<string>();
      
      // Optimization: Create a predicate function for this category's filter check
      // with short-circuit evaluation for better performance
      const shouldInclude = (laptop: Product): boolean => {
        // Apply price filter (fast check first)
        if (laptop.current_price < testFilters.priceRange.min || 
            laptop.current_price > testFilters.priceRange.max) {
          return false;
        }
        
        // Check filters with least computation cost first
        // Apply other category filters with early returns for better performance
        if (testFilters.brands.size > 0 && !matchesAnyInSet(testFilters.brands, laptop.brand, 'brand', laptop.title)) {
          return false;
        }
        
        if (testFilters.processors.size > 0 && !matchesAnyInSet(testFilters.processors, laptop.processor, 'processor', laptop.title)) {
          return false;
        }
        
        if (testFilters.ramSizes.size > 0 && !matchesAnyInSet(testFilters.ramSizes, laptop.ram, 'ram', laptop.title)) {
          return false;
        }
        
        if (testFilters.storageOptions.size > 0 && !matchesAnyInSet(testFilters.storageOptions, laptop.storage, 'storage', laptop.title)) {
          return false;
        }
        
        if (testFilters.graphicsCards.size > 0 && !matchesAnyInSet(testFilters.graphicsCards, laptop.graphics, 'graphics', laptop.title)) {
          return false;
        }
        
        if (testFilters.screenSizes.size > 0 && !matchesAnyInSet(testFilters.screenSizes, laptop.screen_size, 'screen_size', laptop.title)) {
          return false;
        }
        
        return true;
      };
      
      // Helper function to check if any value in a Set matches
      function matchesAnyInSet(
        filterSet: Set<string>, 
        productValue: string | null | undefined, 
        field: FilterableProductKeys, 
        productTitle?: string
      ): boolean {
        for (const value of filterSet) {
          if (matchesFilter(value, productValue, field, productTitle)) {
            return true;
          }
        }
        return false;
      }
      
      // Push all laptops that pass the predicate test - use fast array operations
      const matchingLaptops: Product[] = [];
      for (let i = 0; i < allLaptops.length; i++) {
        if (shouldInclude(allLaptops[i])) {
          matchingLaptops.push(allLaptops[i]);
        }
      }
      
      categoryFilters[category] = matchingLaptops;
    });

    return categoryFilters;
  }, [allLaptops, filters, totalActiveFilters]);
};
