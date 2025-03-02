
import type { Product } from "@/types/product";
import type { FilterableProductKeys } from "@/utils/laptop/filter";
import { normalizerMap, validatorMap } from "../helpers/filterHelpers";
import { sorterMap, sortDefaultOptions } from "../helpers/filterSorters";
import { getStandardizedProcessorValues } from "./processorFilterValues";
import { getValidValues } from "../helpers/filterUtils";

/**
 * Gets unique, validated, and sorted filter options for a specific filter key
 */
export const getUniqueFilterValues = (
  laptops: Product[] | undefined,
  key: FilterableProductKeys
): Set<string> => {
  if (!laptops || laptops.length === 0) {
    return new Set<string>();
  }

  // Special handling for processors to use standardized categories
  if (key === 'processor') {
    return getStandardizedProcessorValues(laptops);
  }

  const normalizer = normalizerMap[key] || ((val: string) => val.trim());
  const validator = validatorMap[key];
  const sorter = sorterMap[key] || sortDefaultOptions;

  // Get validated values
  const values = getValidValues(laptops, key, normalizer, validator);
  
  // Add specific logging for storage to help debug the issue
  if (key === 'storage') {
    console.log(`Storage values before sorting: ${values.length} values`);
    // Log some sample values to understand what's coming in
    if (values.length > 0) {
      console.log('Sample storage values:', values.slice(0, 10));
    }
  }
  
  // Sort values using the appropriate sorter
  const sortedValues = sorter(values);
  
  // Log the sorted values for debugging
  if (sortedValues.length > 0) {
    console.log(`Sorted ${key} filters:`, sortedValues);
  }

  return new Set(sortedValues);
};
