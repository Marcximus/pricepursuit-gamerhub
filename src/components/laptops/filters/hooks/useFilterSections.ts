
import { useMemo } from "react";
import type { FilterSection } from "../types";

/**
 * Creates ordered filter sections with expansion state based on active filters
 */
export const useFilterSections = (
  hasActiveBrandFilters: boolean,
  hasActiveProcessorFilters: boolean,
  hasActiveRamFilters: boolean,
  hasActiveStorageFilters: boolean,
  hasActiveGraphicsFilters: boolean,
  hasActiveScreenSizeFilters: boolean
): {
  filterSections: FilterSection[],
  defaultValues: string[]
} => {
  // User-focused ordering of filter sections
  const filterSections = useMemo(() => [
    { id: "Brand", hasActiveFilters: hasActiveBrandFilters },
    { id: "Processor", hasActiveFilters: hasActiveProcessorFilters },
    { id: "RAM", hasActiveFilters: hasActiveRamFilters },
    { id: "Storage", hasActiveFilters: hasActiveStorageFilters },
    { id: "Graphics", hasActiveFilters: hasActiveGraphicsFilters },
    { id: "Screen Size", hasActiveFilters: hasActiveScreenSizeFilters }
  ], [
    hasActiveBrandFilters,
    hasActiveProcessorFilters,
    hasActiveRamFilters,
    hasActiveStorageFilters,
    hasActiveGraphicsFilters,
    hasActiveScreenSizeFilters
  ]);

  // Set which sections should be expanded by default
  const defaultValues = useMemo(() => {
    const values = filterSections
      .filter(section => section.hasActiveFilters)
      .map(section => section.id);

    // Ensure at least the first filter (Brand) is expanded by default if no filters are active
    if (values.length === 0) {
      values.push("Brand");
    }
    
    return values;
  }, [filterSections]);

  return { filterSections, defaultValues };
};
