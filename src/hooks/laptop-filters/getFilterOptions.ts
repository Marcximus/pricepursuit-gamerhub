import type { Product } from "@/types/product";
import type { FilterableProductKeys } from "@/utils/laptop/filter";
import { 
  getValidValues, 
  normalizerMap, 
  validatorMap 
} from "./filterHelpers";
import { sorterMap, sortDefaultOptions } from "./filterSorters";
import { filterLaptops } from "@/utils/laptop/filter";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

/**
 * Gets unique, validated, and sorted filter options for a specific filter key
 * with two-way validation to ensure each option will match at least one product
 */
export const getUniqueFilterValues = (
  laptops: Product[] | undefined,
  key: FilterableProductKeys,
  activeFilters?: FilterOptions
): Set<string> => {
  if (!laptops || laptops.length === 0) {
    return new Set<string>();
  }

  const normalizer = normalizerMap[key] || ((val: string) => val.trim());
  const validator = validatorMap[key];
  
  // Get validated values
  const values = getValidValues(laptops, key, normalizer, validator);
  
  // Sort values using the appropriate sorter
  const sorter = sorterMap[key] || sortDefaultOptions;
  const sortedValues = sorter(values);
  
  // Two-way validation: Only keep options that match at least one product
  if (activeFilters) {
    return new Set(
      sortedValues.filter(value => {
        // Create a test filter with just this value to check if any products match
        const testFilter = createTestFilter(activeFilters, key, value);
        const matchingLaptops = filterLaptops(laptops, testFilter);
        
        const hasMatches = matchingLaptops.length > 0;
        if (!hasMatches) {
          console.log(`Removing ${key} option "${value}" - no products match`);
        }
        return hasMatches;
      })
    );
  }
  
  return new Set(sortedValues);
};

/**
 * Creates a test filter for checking if a specific filter value matches any products
 * This maintains other active filters to implement filter dependencies
 */
const createTestFilter = (
  activeFilters: FilterOptions,
  key: FilterableProductKeys,
  value: string
): FilterOptions => {
  // Create a copy of the active filters
  const testFilter: FilterOptions = {
    priceRange: { ...activeFilters.priceRange },
    processors: new Set(activeFilters.processors),
    ramSizes: new Set(activeFilters.ramSizes),
    storageOptions: new Set(activeFilters.storageOptions),
    graphicsCards: new Set(activeFilters.graphicsCards),
    screenSizes: new Set(activeFilters.screenSizes),
    brands: new Set(activeFilters.brands)
  };
  
  // Replace the filter for the specified key with a set containing just the test value
  switch (key) {
    case 'processor':
      testFilter.processors = new Set([value]);
      break;
    case 'ram':
      testFilter.ramSizes = new Set([value]);
      break;
    case 'storage':
      testFilter.storageOptions = new Set([value]);
      break;
    case 'graphics':
      testFilter.graphicsCards = new Set([value]);
      break;
    case 'screen_size':
      testFilter.screenSizes = new Set([value]);
      break;
    case 'brand':
      testFilter.brands = new Set([value]);
      break;
  }
  
  return testFilter;
};
