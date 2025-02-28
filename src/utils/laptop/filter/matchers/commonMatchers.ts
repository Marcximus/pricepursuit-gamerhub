
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
  try {
    // Dynamically import the correct matcher based on filter type
    let matcherModule;
    
    switch (filterType) {
      case 'brand':
        matcherModule = require('./brandMatcher');
        return matcherModule.matchesBrandFilter(filterValue, productValue, productTitle);
      case 'graphics':
        matcherModule = require('./graphicsMatcher');
        return matcherModule.matchesGraphicsFilter(filterValue, productValue, productTitle);
      case 'processor':
        matcherModule = require('./processorMatcher');
        return matcherModule.matchesProcessorFilter(filterValue, productValue, productTitle);
      case 'ram':
        matcherModule = require('./ramMatcher');
        return matcherModule.matchesRamFilter(filterValue, productValue, productTitle);
      case 'screen_size':
        matcherModule = require('./screenSizeMatcher');
        return matcherModule.matchesScreenSizeFilter(filterValue, productValue, productTitle);
      case 'storage':
        matcherModule = require('./storageMatcher');
        return matcherModule.matchesStorageFilter(filterValue, productValue, productTitle);
      default:
        console.warn(`No matcher found for filter type: ${filterType}`);
        return false;
    }
  } catch (error) {
    console.error(`Error in matchesFilter for ${filterType}:`, error);
    return false;
  }
};
