
import { useMemo } from "react";
import type { Product } from "@/types/product";
import { getUniqueFilterValues } from "./laptop-filters/getFilterOptions";

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
      // Reordered in a more user-centric way
      brands: getUniqueFilterValues(laptops, 'brand'),            // First filter category
      processors: getUniqueFilterValues(laptops, 'processor'),    // Second filter category
      ramSizes: getUniqueFilterValues(laptops, 'ram'),            // Third filter category
      storageOptions: getUniqueFilterValues(laptops, 'storage'),  // Fourth filter category
      graphicsCards: getUniqueFilterValues(laptops, 'graphics'),  // Fifth filter category
      screenSizes: getUniqueFilterValues(laptops, 'screen_size'), // Last filter category
    };
  }, [laptops]);
};
