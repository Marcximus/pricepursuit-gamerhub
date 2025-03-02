
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterCategoryKey, DisabledOptions } from "../types";
import { findAvailableOptions } from "./useAvailableOptions";

/**
 * Hook to calculate which options should be disabled based on available options
 */
export const useCalculateDisabledOptions = (
  filteredLaptopsByCategory: Record<FilterCategoryKey, Product[]> | null,
  categoryToField: Record<FilterCategoryKey, keyof Product>,
  categoryToOptions: Record<FilterCategoryKey, Set<string>>
) => {
  return useMemo(() => {
    // Default empty disabled options
    const disabledOptions: DisabledOptions = {
      brands: new Set<string>(),
      processors: new Set<string>(),
      ramSizes: new Set<string>(),
      storageOptions: new Set<string>(),
      graphicsCards: new Set<string>(),
      screenSizes: new Set<string>()
    };
    
    // If no filtered laptops, return empty disabled sets
    if (!filteredLaptopsByCategory) {
      return disabledOptions;
    }
    
    // Calculate available options for each category
    const availableOptionsByCategory: Record<FilterCategoryKey, Set<string>> = {
      brands: findAvailableOptions('brands', filteredLaptopsByCategory.brands, categoryToField.brands, categoryToOptions.brands),
      processors: findAvailableOptions('processors', filteredLaptopsByCategory.processors, categoryToField.processors, categoryToOptions.processors),
      ramSizes: findAvailableOptions('ramSizes', filteredLaptopsByCategory.ramSizes, categoryToField.ramSizes, categoryToOptions.ramSizes),
      storageOptions: findAvailableOptions('storageOptions', filteredLaptopsByCategory.storageOptions, categoryToField.storageOptions, categoryToOptions.storageOptions),
      graphicsCards: findAvailableOptions('graphicsCards', filteredLaptopsByCategory.graphicsCards, categoryToField.graphicsCards, categoryToOptions.graphicsCards),
      screenSizes: findAvailableOptions('screenSizes', filteredLaptopsByCategory.screenSizes, categoryToField.screenSizes, categoryToOptions.screenSizes)
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
  }, [filteredLaptopsByCategory, categoryToField, categoryToOptions]);
};

