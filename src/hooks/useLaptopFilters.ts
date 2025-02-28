
import { useMemo } from "react";
import type { Product } from "@/types/product";
import { getUniqueFilterValues, getGroupedBrandValues } from "./laptop-filters/getFilterOptions";

/**
 * Hook for generating laptop filter options based on available laptop data
 */
export const useLaptopFilters = (laptops: Product[] | undefined) => {
  return useMemo(() => {
    if (!laptops || laptops.length === 0) {
      console.log('No laptops available for generating filter options');
      return {
        brands: new Set<string>(),        // First - most important
        processors: new Set<string>(),    // Second - key spec
        ramSizes: new Set<string>(),      // Third - key spec
        storageOptions: new Set<string>(), // Fourth - key spec
        graphicsCards: new Set<string>(),  // Fifth - key spec
        screenSizes: new Set<string>(),    // Last - less critical
      };
    }

    return {
      // Use grouped brands instead of all individual brands
      brands: getGroupedBrandValues(laptops, 15),  // Group brands with fewer than 15 laptops
      processors: getUniqueFilterValues(laptops, 'processor'),
      ramSizes: getUniqueFilterValues(laptops, 'ram'),
      storageOptions: getUniqueFilterValues(laptops, 'storage'),
      graphicsCards: getUniqueFilterValues(laptops, 'graphics'),
      screenSizes: getUniqueFilterValues(laptops, 'screen_size'),
    };
  }, [laptops]);
};
