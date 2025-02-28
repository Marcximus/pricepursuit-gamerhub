
import { useMemo } from "react";
import type { Product } from "@/types/product";
import { getUniqueFilterValues } from "./laptop-filters/getFilterOptions";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

/**
 * Hook for generating laptop filter options based on available laptop data
 * Enhanced to support filter dependencies and two-way validation
 */
export const useLaptopFilters = (
  laptops: Product[] | undefined,
  activeFilters?: FilterOptions
) => {
  return useMemo(() => {
    if (!laptops || laptops.length === 0) {
      console.log('No laptops available for generating filter options');
      return {
        brands: new Set<string>(),
        processors: new Set<string>(),
        ramSizes: new Set<string>(),
        storageOptions: new Set<string>(),
        graphicsCards: new Set<string>(),
        screenSizes: new Set<string>(),
      };
    }

    // Log active filters for debugging
    if (activeFilters) {
      console.log('Generating filter options with active filters:', {
        brands: activeFilters.brands.size,
        processors: activeFilters.processors.size,
        ram: activeFilters.ramSizes.size,
        storage: activeFilters.storageOptions.size,
        graphics: activeFilters.graphicsCards.size,
        screenSizes: activeFilters.screenSizes.size,
        priceRange: activeFilters.priceRange
      });
    }

    return {
      // Pass activeFilters to implement filter dependencies
      brands: getUniqueFilterValues(laptops, 'brand', activeFilters),
      processors: getUniqueFilterValues(laptops, 'processor', activeFilters),
      ramSizes: getUniqueFilterValues(laptops, 'ram', activeFilters),
      storageOptions: getUniqueFilterValues(laptops, 'storage', activeFilters),
      graphicsCards: getUniqueFilterValues(laptops, 'graphics', activeFilters),
      screenSizes: getUniqueFilterValues(laptops, 'screen_size', activeFilters),
    };
  }, [laptops, activeFilters]);
};
