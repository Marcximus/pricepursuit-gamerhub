
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
      
      // Optimization: Create a predicate function for this category's filter check
      // instead of using a full filter() operation for better performance
      const shouldInclude = (laptop: Product): boolean => {
        // Apply price filter
        if (laptop.current_price < testFilters.priceRange.min || 
            laptop.current_price > testFilters.priceRange.max) {
          return false;
        }
        
        // Apply other category filters with early returns for better performance
        if (testFilters.brands.size > 0) {
          let matches = false;
          for (const brand of testFilters.brands) {
            if (matchesFilter(brand, laptop.brand, 'brand', laptop.title)) {
              matches = true;
              break;
            }
          }
          if (!matches) return false;
        }
        
        if (testFilters.processors.size > 0) {
          let matches = false;
          for (const processor of testFilters.processors) {
            if (matchesFilter(processor, laptop.processor, 'processor', laptop.title)) {
              matches = true;
              break;
            }
          }
          if (!matches) return false;
        }
        
        if (testFilters.ramSizes.size > 0) {
          let matches = false;
          for (const ram of testFilters.ramSizes) {
            if (matchesFilter(ram, laptop.ram, 'ram', laptop.title)) {
              matches = true;
              break;
            }
          }
          if (!matches) return false;
        }
        
        if (testFilters.storageOptions.size > 0) {
          let matches = false;
          for (const storage of testFilters.storageOptions) {
            if (matchesFilter(storage, laptop.storage, 'storage', laptop.title)) {
              matches = true;
              break;
            }
          }
          if (!matches) return false;
        }
        
        if (testFilters.graphicsCards.size > 0) {
          let matches = false;
          for (const graphics of testFilters.graphicsCards) {
            if (matchesFilter(graphics, laptop.graphics, 'graphics', laptop.title)) {
              matches = true;
              break;
            }
          }
          if (!matches) return false;
        }
        
        if (testFilters.screenSizes.size > 0) {
          let matches = false;
          for (const screenSize of testFilters.screenSizes) {
            if (matchesFilter(screenSize, laptop.screen_size, 'screen_size', laptop.title)) {
              matches = true;
              break;
            }
          }
          if (!matches) return false;
        }
        
        return true;
      };
      
      // Push all laptops that pass the predicate test
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
