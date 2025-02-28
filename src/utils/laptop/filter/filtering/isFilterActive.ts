
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

/**
 * Checks if any filter is active
 */
export const hasActiveFilters = (filters: FilterOptions): boolean => {
  return filters.processors.size > 0 || 
    filters.ramSizes.size > 0 ||
    filters.storageOptions.size > 0 ||
    filters.graphicsCards.size > 0 ||
    filters.screenSizes.size > 0 ||
    filters.brands.size > 0 ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 10000;
};
