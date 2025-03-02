
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
      // First collect all available options using an optimized approach
      const availableOptions = new Set<string>();
      
      // Get the field name corresponding to the category
      const optionField = {
        'brands': 'brand',
        'processors': 'processor',
        'ramSizes': 'ram',
        'storageOptions': 'storage',
        'graphicsCards': 'graphics',
        'screenSizes': 'screen_size'
      }[category] as 'brand' | 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size';
      
      // Optimize by creating a Map to track which options we've already checked for each laptop
      const checkedOptionsMap = new Map<string, Set<string>>();
      
      // Create an index of laptops by their values for this category
      const laptopsByValue = new Map<string, Product[]>();
      
      // Index laptops by their field values (only once)
      laptops.forEach(laptop => {
        const fieldValue = laptop[optionField];
        if (fieldValue) {
          const normalizedValue = String(fieldValue).toLowerCase();
          if (!laptopsByValue.has(normalizedValue)) {
            laptopsByValue.set(normalizedValue, []);
          }
          laptopsByValue.get(normalizedValue)?.push(laptop);
        }
      });
      
      // Now check which options match laptops using the index
      Array.from(allOptions).forEach(option => {
        // Skip if we've already determined this option is available
        if (availableOptions.has(option)) return;
        
        // Check if any laptop matches this option
        let isAvailable = false;
        
        for (const [fieldValue, laptopsWithValue] of laptopsByValue.entries()) {
          // Skip if we've already checked this combination
          const optionLower = option.toLowerCase();
          if (!checkedOptionsMap.has(optionLower)) {
            checkedOptionsMap.set(optionLower, new Set());
          }
          
          const checkedValues = checkedOptionsMap.get(optionLower)!;
          if (checkedValues.has(fieldValue)) continue;
          
          // Mark as checked
          checkedValues.add(fieldValue);
          
          // Only need to check the first laptop with this value since the matcher behavior
          // will be the same for all laptops with the same field value
          const laptop = laptopsWithValue[0];
          if (matchesFilter(option, laptop[optionField], optionField, laptop.title)) {
            isAvailable = true;
            break;
          }
        }
        
        if (isAvailable) {
          availableOptions.add(option);
        }
      });
      
      // Create the set of disabled options
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
