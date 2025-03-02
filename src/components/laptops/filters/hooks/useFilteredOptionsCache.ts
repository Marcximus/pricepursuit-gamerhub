
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions, FilterCategoryKey } from "../types";
import { matchesFilter } from "@/utils/laptop/filter/matchers";
import type { FilterableProductKeys } from "@/utils/laptop/filter/filterTypes";

/**
 * Memoized cache for computing available options based on current filters
 * With significant performance improvements through indexing and early returns
 */
export const useFilteredOptionsCache = (
  allLaptops: Product[],
  filters: FilterOptions,
  totalActiveFilters: number
) => {
  return useMemo(() => {
    // Skip calculation if no filters active or no laptops (immediate performance win)
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
    
    // Fast lookup fields map to reduce property access overhead
    const fieldMap: Record<FilterCategoryKey, FilterableProductKeys> = {
      brands: 'brand',
      processors: 'processor',
      ramSizes: 'ram',
      storageOptions: 'storage',
      graphicsCards: 'graphics',
      screenSizes: 'screen_size'
    };

    // For each category, create a filtered set of laptops that match all OTHER filters
    Object.keys(categoryFilters).forEach((categoryKey) => {
      const category = categoryKey as FilterCategoryKey;
      
      // Create test filters without the current category
      const testFilters = { ...filters };
      
      // Clear the category we're testing - use direct property access for better performance
      testFilters[category] = new Set<string>();
      
      // Performance critical section - use array indexing instead of forEach
      const filteredLaptops: Product[] = [];
      const laptopsLength = allLaptops.length;
      
      for (let i = 0; i < laptopsLength; i++) {
        const laptop = allLaptops[i];
        
        // Apply price filter first (fastest to check)
        if (laptop.current_price < testFilters.priceRange.min || 
            laptop.current_price > testFilters.priceRange.max) {
          continue;
        }
        
        // Apply remaining filters with short circuit evaluation
        let matches = true;
        
        // Check brands filter
        if (testFilters.brands.size > 0) {
          let brandMatch = false;
          for (const brand of testFilters.brands) {
            if (matchesFilter(brand, laptop.brand, 'brand', laptop.title)) {
              brandMatch = true;
              break;
            }
          }
          if (!brandMatch) {
            matches = false;
            continue;
          }
        }
        
        // Check processors filter
        if (matches && testFilters.processors.size > 0) {
          let processorMatch = false;
          for (const processor of testFilters.processors) {
            if (matchesFilter(processor, laptop.processor, 'processor', laptop.title)) {
              processorMatch = true;
              break;
            }
          }
          if (!processorMatch) {
            matches = false;
            continue;
          }
        }
        
        // Check RAM filter
        if (matches && testFilters.ramSizes.size > 0) {
          let ramMatch = false;
          for (const ram of testFilters.ramSizes) {
            if (matchesFilter(ram, laptop.ram, 'ram', laptop.title)) {
              ramMatch = true;
              break;
            }
          }
          if (!ramMatch) {
            matches = false;
            continue;
          }
        }
        
        // Check storage filter
        if (matches && testFilters.storageOptions.size > 0) {
          let storageMatch = false;
          for (const storage of testFilters.storageOptions) {
            if (matchesFilter(storage, laptop.storage, 'storage', laptop.title)) {
              storageMatch = true;
              break;
            }
          }
          if (!storageMatch) {
            matches = false;
            continue;
          }
        }
        
        // Check graphics filter
        if (matches && testFilters.graphicsCards.size > 0) {
          let graphicsMatch = false;
          for (const graphics of testFilters.graphicsCards) {
            if (matchesFilter(graphics, laptop.graphics, 'graphics', laptop.title)) {
              graphicsMatch = true;
              break;
            }
          }
          if (!graphicsMatch) {
            matches = false;
            continue;
          }
        }
        
        // Check screen size filter
        if (matches && testFilters.screenSizes.size > 0) {
          let screenMatch = false;
          for (const screen of testFilters.screenSizes) {
            if (matchesFilter(screen, laptop.screen_size, 'screen_size', laptop.title)) {
              screenMatch = true;
              break;
            }
          }
          if (!screenMatch) {
            matches = false;
            continue;
          }
        }
        
        // If laptop passes all filters, add it to the result
        if (matches) {
          filteredLaptops.push(laptop);
        }
      }
      
      categoryFilters[category] = filteredLaptops;
    });

    return categoryFilters;
  }, [allLaptops, filters, totalActiveFilters]);
};
