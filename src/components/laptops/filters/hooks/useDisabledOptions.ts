
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions, DisabledOptions } from "../types";
import { useFilteredOptionsCache } from "./useFilteredOptionsCache";
import { useCategoryMappings } from "./useCategoryMappings";
import { useCalculateDisabledOptions } from "./useCalculateDisabledOptions";

/**
 * Optimized hook to calculate which filter options should be disabled
 * Uses indexing, memoization and fast Set operations for better performance
 * Refactored into smaller, more maintainable components
 */
export const useDisabledOptions = (
  filters: FilterOptions, 
  allLaptops: Product[],
  totalActiveFilters: number,
  processors: Set<string>,
  ramSizes: Set<string>,
  storageOptions: Set<string>,
  graphicsCards: Set<string>,
  screenSizes: Set<string>,
  brands: Set<string>
) => {
  // Get category to field and options mappings
  const { categoryToField, categoryToOptions } = useCategoryMappings(
    processors,
    ramSizes,
    storageOptions,
    graphicsCards,
    screenSizes,
    brands
  );

  // Get pre-filtered laptops for each category
  const filteredLaptopsByCategory = useFilteredOptionsCache(
    allLaptops, 
    filters, 
    totalActiveFilters
  );

  // Create early return for empty state
  const emptyDisabledOptions = useMemo<DisabledOptions>(() => ({
    brands: new Set<string>(),
    processors: new Set<string>(),
    ramSizes: new Set<string>(),
    storageOptions: new Set<string>(),
    graphicsCards: new Set<string>(),
    screenSizes: new Set<string>(),
  }), []);

  // Fast return for empty state - no need to calculate disabled options
  if (totalActiveFilters === 0 || allLaptops.length === 0 || !filteredLaptopsByCategory) {
    return emptyDisabledOptions;
  }

  // Calculate the disabled options
  return useCalculateDisabledOptions(
    filteredLaptopsByCategory,
    categoryToField,
    categoryToOptions
  );
};
