
import { useMemo } from "react";
import { useAllLaptops } from "./useLaptops";
import type { Product } from "@/types/product";

type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

export const useLaptopFilters = () => {
  // Use the same query as the main laptop list
  const { data: allLaptops = [] } = useAllLaptops();

  return useMemo(() => {
    const getUniqueValues = (key: FilterableProductKeys) => {
      if (allLaptops.length === 0) {
        console.log(`No laptops available for ${key} filter`);
        return new Set<string>();
      }
      
      // Filter out null/undefined/empty values and normalize strings
      const validValues = allLaptops
        .map(laptop => laptop[key])
        .filter((value): value is string => 
          value != null && 
          typeof value === 'string' && 
          value.trim() !== ''
        )
        .map(value => value.trim());

      // Create a unique set of values
      const uniqueValues = Array.from(new Set(validValues)).sort();
      
      console.log(`Generated ${key} filter options:`, {
        total: uniqueValues.length,
        values: uniqueValues
      });
      
      return new Set(uniqueValues);
    };

    const filterOptions = {
      processors: getUniqueValues('processor'),
      ramSizes: getUniqueValues('ram'),
      storageOptions: getUniqueValues('storage'),
      graphicsCards: getUniqueValues('graphics'),
      screenSizes: getUniqueValues('screen_size'),
      brands: getUniqueValues('brand'),
    };

    console.log('Generated all filter options:', {
      totalLaptops: allLaptops.length,
      brands: Array.from(filterOptions.brands),
      totalBrands: filterOptions.brands.size,
      processors: Array.from(filterOptions.processors).length,
      ram: Array.from(filterOptions.ramSizes).length,
      storage: Array.from(filterOptions.storageOptions).length,
      graphics: Array.from(filterOptions.graphicsCards).length,
      screenSizes: Array.from(filterOptions.screenSizes).length
    });

    return filterOptions;
  }, [allLaptops]);
};
