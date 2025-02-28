
import type { FilterableProductKeys, MatcherFunction } from "../filterTypes";
import { matchesBrandFilter } from "./brandMatcher";
import { matchesGraphicsFilter } from "./graphicsMatcher";
import { matchesProcessorFilter } from "./processorMatcher";
import { matchesRamFilter } from "./ramMatcher";
import { matchesScreenSizeFilter } from "./screenSizeMatcher";
import { matchesStorageFilter } from "./storageMatcher";

/**
 * Common utility to parse value with unit from a string
 */
export const parseValueWithUnit = (
  value: string | null | undefined, 
  defaultUnit = 'GB'
): { value: number; unit: string } | null => {
  if (!value) return null;
  const match = value.match(/(\d+(\.\d+)?)\s*(GB|TB|MB|gb|tb|mb)/i);
  if (!match) return null;
  
  const [, amount, , unit] = match;
  return {
    value: parseFloat(amount),
    unit: unit?.toLowerCase() || defaultUnit.toLowerCase()
  };
};

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
