
import { useMemo } from "react";
import type { Product } from "@/types/product";

type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

export const useLaptopFilters = (laptops: Product[] | undefined) => {
  return useMemo(() => {
    const getUniqueValues = (key: FilterableProductKeys) => {
      if (!laptops) return new Set<string>();
      
      // Filter out null/undefined values and normalize strings
      const validValues = laptops
        .map(laptop => laptop[key])
        .filter((value): value is string => value != null && value !== '')
        .map(value => value.trim());
      
      // Create a Set of unique values
      return new Set(validValues);
    };

    console.log('Generating filter options from laptops:', {
      totalLaptops: laptops?.length,
      brands: getUniqueValues('brand'),
      processors: getUniqueValues('processor'),
      ram: getUniqueValues('ram'),
      storage: getUniqueValues('storage'),
      graphics: getUniqueValues('graphics'),
      screenSizes: getUniqueValues('screen_size')
    });

    return {
      processors: getUniqueValues('processor'),
      ramSizes: getUniqueValues('ram'),
      storageOptions: getUniqueValues('storage'),
      graphicsCards: getUniqueValues('graphics'),
      screenSizes: getUniqueValues('screen_size'),
      brands: getUniqueValues('brand'),
    };
  }, [laptops]);
};
