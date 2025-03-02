
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions, FilterCategoryKey } from "../types";
import { matchesFilter } from "@/utils/laptop/filter/matchers";

/**
 * Efficient cache for computing available options based on current filters
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
      
      // Filter laptops based on all other filters
      categoryFilters[category] = allLaptops.filter(laptop => {
        // Apply price filter
        if (laptop.current_price < testFilters.priceRange.min || 
            laptop.current_price > testFilters.priceRange.max) {
          return false;
        }
        
        // Apply other category filters
        if (testFilters.brands.size > 0 && 
            !Array.from(testFilters.brands).some(brand => 
              matchesFilter(brand, laptop.brand, 'brand', laptop.title))) {
          return false;
        }
        
        if (testFilters.processors.size > 0 && 
            !Array.from(testFilters.processors).some(processor => 
              matchesFilter(processor, laptop.processor, 'processor', laptop.title))) {
          return false;
        }
        
        if (testFilters.ramSizes.size > 0 && 
            !Array.from(testFilters.ramSizes).some(ram => 
              matchesFilter(ram, laptop.ram, 'ram', laptop.title))) {
          return false;
        }
        
        if (testFilters.storageOptions.size > 0 && 
            !Array.from(testFilters.storageOptions).some(storage => 
              matchesFilter(storage, laptop.storage, 'storage', laptop.title))) {
          return false;
        }
        
        if (testFilters.graphicsCards.size > 0 && 
            !Array.from(testFilters.graphicsCards).some(graphics => 
              matchesFilter(graphics, laptop.graphics, 'graphics', laptop.title))) {
          return false;
        }
        
        if (testFilters.screenSizes.size > 0 && 
            !Array.from(testFilters.screenSizes).some(screenSize => 
              matchesFilter(screenSize, laptop.screen_size, 'screen_size', laptop.title))) {
          return false;
        }
        
        return true;
      });
    });

    return categoryFilters;
  }, [allLaptops, filters, totalActiveFilters]);
};
