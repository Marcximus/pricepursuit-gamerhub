
import type { FilterableProductKeys, MatcherFunction } from "../filterTypes";
import { matchesBrandFilter } from "./brandMatcher";
import { matchesGraphicsFilter } from "./graphicsMatcher";
import { matchesProcessorFilter } from "./processorMatcher";
import { matchesRamFilter } from "./ramMatcher";
import { matchesScreenSizeFilter } from "./screenSizeMatcher";
import { matchesStorageFilter } from "./storageMatcher";

// Mapping of filter keys to their specific matcher functions
const matchers: Record<FilterableProductKeys, MatcherFunction> = {
  brand: matchesBrandFilter,
  graphics: matchesGraphicsFilter,
  processor: matchesProcessorFilter,
  ram: matchesRamFilter,
  screen_size: matchesScreenSizeFilter,
  storage: matchesStorageFilter,
};

/**
 * Generic function to check if a product value matches a filter value
 * Delegates to specific matcher functions based on the filter type
 */
export const matchesFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  filterType: FilterableProductKeys,
  productTitle?: string
): boolean => {
  // If no matcher exists for this filter type, return false
  if (!matchers[filterType]) {
    console.warn(`No matcher found for filter type: ${filterType}`);
    return false;
  }

  // Delegate to the appropriate matcher function
  return matchers[filterType](filterValue, productValue, productTitle);
};
