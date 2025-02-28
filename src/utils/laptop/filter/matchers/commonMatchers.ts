
import type { FilterableProductKeys, MatcherFunction } from "../filterTypes";

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

// Forward declare the matcher function type to avoid circular dependencies
let matchers: Record<FilterableProductKeys, MatcherFunction> | null = null;

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
  // Initialize matchers if not already done
  if (!matchers) {
    // Import these here to avoid circular dependencies
    const { matchesBrandFilter } = require('./brandMatcher');
    const { matchesGraphicsFilter } = require('./graphicsMatcher');
    const { matchesProcessorFilter } = require('./processorMatcher');
    const { matchesRamFilter } = require('./ramMatcher');
    const { matchesScreenSizeFilter } = require('./screenSizeMatcher');
    const { matchesStorageFilter } = require('./storageMatcher');
    
    matchers = {
      brand: matchesBrandFilter,
      graphics: matchesGraphicsFilter,
      processor: matchesProcessorFilter,
      ram: matchesRamFilter,
      screen_size: matchesScreenSizeFilter,
      storage: matchesStorageFilter,
    };
  }

  // If no matcher exists for this filter type, return false
  if (!matchers[filterType]) {
    console.warn(`No matcher found for filter type: ${filterType}`);
    return false;
  }

  // Delegate to the appropriate matcher function
  return matchers[filterType](filterValue, productValue, productTitle);
};
