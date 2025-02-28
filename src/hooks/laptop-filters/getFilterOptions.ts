import type { Product } from "@/types/product";
import type { FilterableProductKeys } from "@/utils/laptop/filter";
import { 
  getValidValues, 
  normalizerMap, 
  validatorMap 
} from "./filterHelpers";
import { sorterMap, sortDefaultOptions } from "./filterSorters";

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

  const normalizer = normalizerMap[key] || ((val: string) => val.trim());
  const validator = validatorMap[key];
  const sorter = sorterMap[key] || sortDefaultOptions;

  // Get validated values
  const values = getValidValues(laptops, key, normalizer, validator);
  
  // Clean up filter display values (especially for graphics cards)
  let cleanedValues = values;
  if (key === 'graphics') {
    cleanedValues = values.map(value => {
      // Remove duplicated brands in display
      return value
        .replace(/nvidia\s+nvidia/i, 'NVIDIA')
        .replace(/amd\s+amd/i, 'AMD')
        .replace(/intel\s+intel/i, 'Intel');
    });
  }

  // Additional storage validation - only keep values that have at least one matching laptop
  if (key === 'storage') {
    cleanedValues = cleanedValues.filter(value => {
      // Count laptops that match this storage value
      const matchCount = laptops.filter(laptop => 
        laptop.storage && normalizer(laptop.storage) === value
      ).length;
      
      // Only keep filter values that have actual matching laptops
      return matchCount > 0;
    });
  }
  
  // Sort values using the appropriate sorter
  const sortedValues = sorter(cleanedValues);
  
  // Log the sorted values for debugging
  if (sortedValues.length > 0 && key === 'storage') {
    console.log(`Sorted ${key} filters:`, sortedValues);
  }

  return new Set(sortedValues);
};
