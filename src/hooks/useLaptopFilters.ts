
import { useMemo } from "react";
import type { Product } from "@/types/product";

type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

export const useLaptopFilters = (laptops: Product[] | undefined) => {
  return useMemo(() => {
    const getUniqueValues = (key: FilterableProductKeys) => {
      if (!laptops) return new Set<string>();
      
      // Filter out null/undefined values, normalize strings, and ensure unique values
      const validValues = laptops
        .map(laptop => laptop[key])
        .filter((value): value is string => 
          value != null && 
          typeof value === 'string' && 
          value.trim() !== ''
        )
        .map(value => value.trim())
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort();
      
      return new Set(validValues);
    };

    const filterOptions = {
      processors: getUniqueValues('processor'),
      ramSizes: getUniqueValues('ram'),
      storageOptions: getUniqueValues('storage'),
      graphicsCards: getUniqueValues('graphics'),
      screenSizes: getUniqueValues('screen_size'),
      brands: getUniqueValues('brand'),
    };

    console.log('Generated filter options:', {
      totalLaptops: laptops?.length,
      brands: Array.from(filterOptions.brands),
      totalBrands: filterOptions.brands.size,
      processors: Array.from(filterOptions.processors).length,
      ram: Array.from(filterOptions.ramSizes).length,
      storage: Array.from(filterOptions.storageOptions).length,
      graphics: Array.from(filterOptions.graphicsCards).length,
      screenSizes: Array.from(filterOptions.screenSizes).length
    });

    return filterOptions;
  }, [laptops]);
};
