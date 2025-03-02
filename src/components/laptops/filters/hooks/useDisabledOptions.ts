
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions, DisabledOptions, FilterCategoryKey } from "../types";
import { matchesFilter } from "@/utils/laptop/filter/matchers";
import { useFilteredOptionsCache } from "./useFilteredOptionsCache";

/**
 * Hook to calculate which filter options should be disabled based on other selected filters
 * With optimized performance
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
    if (totalActiveFilters === 0 || allLaptops.length === 0) {
      return {
        brands: new Set<string>(),
        processors: new Set<string>(),
        ramSizes: new Set<string>(),
        storageOptions: new Set<string>(),
        graphicsCards: new Set<string>(),
        screenSizes: new Set<string>(),
      };
    }
    
    // If we don't have the filtered laptops cache, return empty sets
    if (!filteredLaptopsByCategory) {
      return {
        brands: new Set<string>(),
        processors: new Set<string>(),
        ramSizes: new Set<string>(),
        storageOptions: new Set<string>(),
        graphicsCards: new Set<string>(),
        screenSizes: new Set<string>(),
      };
    }
    
    // Function to calculate disabled options for a specific category
    const calculateDisabledOptionsForCategory = (
      category: FilterCategoryKey,
      allOptions: Set<string>,
      laptops: Product[]
    ) => {
      // First collect all available options
      const availableOptions = new Set<string>();
      
      // Instead of nested loops for each laptop and each option,
      // build a map of options that match at least one laptop
      const optionField = {
        'brands': 'brand',
        'processors': 'processor',
        'ramSizes': 'ram',
        'storageOptions': 'storage',
        'graphicsCards': 'graphics',
        'screenSizes': 'screen_size'
      }[category] as 'brand' | 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size';
      
      // Process in batches to avoid blocking UI
      const batchSize = 100;
      for (let i = 0; i < laptops.length; i += batchSize) {
        const batch = laptops.slice(i, i + batchSize);
        
        batch.forEach(laptop => {
          Array.from(allOptions).forEach(option => {
            if (matchesFilter(option, laptop[optionField], optionField, laptop.title)) {
              availableOptions.add(option);
            }
          });
        });
      }
      
      // Now create the disabled options set
      const disabledOptions = new Set<string>();
      Array.from(allOptions).forEach(option => {
        if (!availableOptions.has(option)) {
          disabledOptions.add(option);
        }
      });
      
      return disabledOptions;
    };
    
    // Calculate disabled options for each category using the pre-filtered laptops
    return {
      brands: calculateDisabledOptionsForCategory('brands', brands, filteredLaptopsByCategory.brands),
      processors: calculateDisabledOptionsForCategory('processors', processors, filteredLaptopsByCategory.processors),
      ramSizes: calculateDisabledOptionsForCategory('ramSizes', ramSizes, filteredLaptopsByCategory.ramSizes),
      storageOptions: calculateDisabledOptionsForCategory('storageOptions', storageOptions, filteredLaptopsByCategory.storageOptions),
      graphicsCards: calculateDisabledOptionsForCategory('graphicsCards', graphicsCards, filteredLaptopsByCategory.graphicsCards),
      screenSizes: calculateDisabledOptionsForCategory('screenSizes', screenSizes, filteredLaptopsByCategory.screenSizes),
    };
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
