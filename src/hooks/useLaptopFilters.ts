
import { useMemo } from "react";
import type { Product } from "@/types/product";

type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

export const useLaptopFilters = (laptops: Product[] | undefined) => {
  return useMemo(() => {
    const getUniqueValues = (key: FilterableProductKeys) => {
      if (!laptops) return new Set<string>();
      return new Set(laptops.map(laptop => {
        const value = laptop[key];
        return value ? String(value) : null;
      }).filter(Boolean));
    };

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

