
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
  // We'll dynamically import the matcher to avoid circular dependencies
  let matcherFn: MatcherFunction | undefined;
  
  switch (filterType) {
    case 'brand':
      // Using dynamic import to avoid circular dependency
      const { matchesBrandFilter } = require('./brandMatcher');
      matcherFn = matchesBrandFilter;
      break;
    case 'graphics':
      const { matchesGraphicsFilter } = require('./graphicsMatcher');
      matcherFn = matchesGraphicsFilter;
      break;
    case 'processor':
      const { matchesProcessorFilter } = require('./processorMatcher');
      matcherFn = matchesProcessorFilter;
      break;
    case 'ram':
      const { matchesRamFilter } = require('./ramMatcher');
      matcherFn = matchesRamFilter;
      break;
    case 'screen_size':
      const { matchesScreenSizeFilter } = require('./screenSizeMatcher');
      matcherFn = matchesScreenSizeFilter;
      break;
    case 'storage':
      const { matchesStorageFilter } = require('./storageMatcher');
      matcherFn = matchesStorageFilter;
      break;
    default:
      console.warn(`No matcher found for filter type: ${filterType}`);
      return false;
  }

  // Use the matcher function
  if (!matcherFn) {
    return false;
  }
  
  return matcherFn(filterValue, productValue, productTitle);
};
