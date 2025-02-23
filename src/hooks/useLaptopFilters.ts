
import { useMemo } from "react";
import type { Product } from "@/types/product";

type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

export const useLaptopFilters = (laptops: Product[] | undefined) => {
  // Split this into two parts: one for getting all available options,
  // and another for the current filter state
  return useMemo(() => {
    const getUniqueValues = (key: FilterableProductKeys) => {
      if (!laptops || laptops.length === 0) {
        console.log(`No laptops available for ${key} filter`);
        return new Set<string>();
      }
      
      // Filter out null/undefined/empty values and normalize strings
      const validValues = laptops
        .map(laptop => {
          if (key === 'graphics') {
            console.log('Raw graphics value:', laptop[key], 'from laptop:', laptop.title);
          }
          return laptop[key];
        })
        .filter((value): value is string => {
          const isValid = value != null && 
            typeof value === 'string' && 
            value.trim() !== '';
          if (key === 'graphics' && !isValid) {
            console.log('Filtered out invalid graphics value:', value);
          }
          return isValid;
        })
        .map(value => value.trim());

      // Create a unique set of values
      const uniqueValues = Array.from(new Set(validValues)).sort();
      
      console.log(`Generated ${key} filter options:`, {
        total: uniqueValues.length,
        values: uniqueValues.slice(0, 20) // Show first 20 values for debugging
      });
      
      return new Set(uniqueValues);
    };

    // Always generate all possible filter options from the complete dataset
    const filterOptions = {
      processors: getUniqueValues('processor'),
      ramSizes: getUniqueValues('ram'),
      storageOptions: getUniqueValues('storage'),
      graphicsCards: getUniqueValues('graphics'),
      screenSizes: getUniqueValues('screen_size'),
      brands: getUniqueValues('brand'),
    };

    console.log('Generated all filter options:', {
      totalLaptops: laptops?.length,
      brands: Array.from(filterOptions.brands).length,
      processors: Array.from(filterOptions.processors).length,
      ram: Array.from(filterOptions.ramSizes).length,
      storage: Array.from(filterOptions.storageOptions).length,
      graphics: Array.from(filterOptions.graphicsCards).length,
      screenSizes: Array.from(filterOptions.screenSizes).length
    });

    return filterOptions;
  }, [laptops]); // Only depend on the laptops array, not on any filters
};
