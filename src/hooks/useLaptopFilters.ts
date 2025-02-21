
import { useMemo } from "react";
import type { Product } from "@/types/product";

export const useLaptopFilters = (laptops: Product[] | undefined) => {
  return useMemo(() => {
    const getUniqueValues = (key: keyof Product) => {
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
