
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions, DisabledOptions, FilterCategoryKey } from "../types";
import { matchesFilter } from "@/utils/laptop/filter/matchers";
import { useFilteredOptionsCache } from "./useFilteredOptionsCache";

/**
 * Hook to calculate which filter options should be disabled based on other selected filters
 * With optimized performance through memoization, indexing and early returns
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
    
    // Optimization: Create a Map to cache field values for each laptop category
    const fieldValueCache = new Map<FilterCategoryKey, Map<string, string[]>>();
    
    // Pre-compute field values for laptops in each category for faster lookups
    const precomputeFieldValues = () => {
      const categoryFieldMap: Record<FilterCategoryKey, keyof Product> = {
        'brands': 'brand',
        'processors': 'processor',
        'ramSizes': 'ram',
        'storageOptions': 'storage',
        'graphicsCards': 'graphics',
        'screenSizes': 'screen_size'
      };
      
      Object.entries(filteredLaptopsByCategory).forEach(([category, laptops]) => {
        const field = categoryFieldMap[category as FilterCategoryKey];
        const valueMap = new Map<string, string[]>();
        
        laptops.forEach(laptop => {
          const fieldValue = laptop[field];
          if (fieldValue) {
            const normalizedValue = String(fieldValue).toLowerCase();
            if (!valueMap.has(normalizedValue)) {
              valueMap.set(normalizedValue, []);
            }
            valueMap.get(normalizedValue)?.push(normalizedValue);
          }
        });
        
        fieldValueCache.set(category as FilterCategoryKey, valueMap);
      });
    };
    
    // Precompute the field values
    precomputeFieldValues();
    
    // Function to calculate disabled options for a specific category with optimized lookups
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
      
      // Performance optimization: Only index the laptops once, not for each option
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
      // Optimization: Convert allOptions to array for faster iteration
      const allOptionsArray = Array.from(allOptions);
      
      // Use faster for-loop with indexing instead of forEach
      for (let i = 0; i < allOptionsArray.length; i++) {
        const option = allOptionsArray[i];
        
        // Skip if we've already determined this option is available
        if (availableOptions.has(option)) continue;
        
        // Check if any laptop matches this option
        let isAvailable = false;
        const optionLower = option.toLowerCase();
        
        if (!checkedOptionsMap.has(optionLower)) {
          checkedOptionsMap.set(optionLower, new Set());
        }
        
        const checkedValues = checkedOptionsMap.get(optionLower)!;
        
        // Use faster for-of with Map.entries() instead of nested loops
        for (const [fieldValue, laptopsWithValue] of laptopsByValue) {
          // Skip if we've already checked this combination
          if (checkedValues.has(fieldValue)) continue;
          
          // Mark as checked
          checkedValues.add(fieldValue);
          
          // Only need to check the first laptop with this value
          if (laptopsWithValue.length > 0) {
            const laptop = laptopsWithValue[0];
            if (matchesFilter(option, laptop[optionField], optionField, laptop.title)) {
              isAvailable = true;
              break;
            }
          }
        }
        
        if (isAvailable) {
          availableOptions.add(option);
        }
      }
      
      // Create the set of disabled options efficiently
      const disabledOptions = new Set<string>();
      for (let i = 0; i < allOptionsArray.length; i++) {
        const option = allOptionsArray[i];
        if (!availableOptions.has(option)) {
          disabledOptions.add(option);
        }
      }
      
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
