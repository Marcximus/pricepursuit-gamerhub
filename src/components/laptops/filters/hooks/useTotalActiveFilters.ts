
import { useMemo } from "react";
import type { FilterOptions } from "../types";

/**
 * Calculates the total number of active filters across all categories
 */
export const useTotalActiveFilters = (filters: FilterOptions): number => {
  return useMemo(() => {
    return (filters.priceRange.min > 0 || filters.priceRange.max < 10000 ? 1 : 0) +
      filters.brands.size + 
      filters.processors.size + 
      filters.ramSizes.size + 
      filters.storageOptions.size + 
      filters.graphicsCards.size + 
      filters.screenSizes.size;
  }, [
    filters.priceRange.min,
    filters.priceRange.max,
    filters.brands.size,
    filters.processors.size,
    filters.ramSizes.size,
    filters.storageOptions.size,
    filters.graphicsCards.size,
    filters.screenSizes.size
  ]);
};
