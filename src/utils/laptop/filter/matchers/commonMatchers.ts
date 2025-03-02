
import type { FilterableProductKeys } from "../filterTypes";
import { matchesBrandFilter } from './brandMatcher';
import { matchesGraphicsFilter } from './graphics/graphicsMatcherCore';
import { matchesProcessorFilter } from './processor/processorMatcherCore';
import { matchesRamFilter } from './ramMatcher';
import { matchesScreenSizeFilter } from './screenSizeMatcher';
import { matchesStorageFilter } from './storageMatcher';

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
    console.log(`Matching filter: '${filterValue}' with product value: '${productValue}', type: ${filterType}`);
    
    // Use direct function calls instead of dynamic imports
    switch (filterType) {
      case 'brand':
        const brandResult = matchesBrandFilter(filterValue, productValue, productTitle);
        console.log(`Brand match result: ${brandResult}`);
        return brandResult;
      case 'graphics':
        return matchesGraphicsFilter(filterValue, productValue, productTitle);
      case 'processor':
        return matchesProcessorFilter(filterValue, productValue, productTitle);
      case 'ram':
        return matchesRamFilter(filterValue, productValue, productTitle);
      case 'screen_size':
        return matchesScreenSizeFilter(filterValue, productValue, productTitle);
      case 'storage':
        return matchesStorageFilter(filterValue, productValue, productTitle);
      default:
        console.warn(`No matcher found for filter type: ${filterType}`);
        return false;
    }
  } catch (error) {
    console.error(`Error in matchesFilter for ${filterType}:`, error);
    return false;
  }
};
