
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

  // Log the total number of non-null values for this field
  const totalWithValue = laptops.filter(laptop => laptop[key] && String(laptop[key]).trim() !== '').length;
  console.log(`Extracting unique ${key} values: ${totalWithValue} laptops have non-empty values`);

  // Special handling for processors to use standardized categories
  if (key === 'processor') {
    return getStandardizedProcessorValues(laptops);
  }

  const normalizer = normalizerMap[key] || ((val: string) => val.trim());
  const validator = validatorMap[key];
  
  // Get all valid, normalized values
  const values = getValidValues(laptops, key, normalizer, validator);
  
  // Add specific logging for debugging
  console.log(`${key}: Found ${values.length} unique values after normalization and validation`);
  
  // Storage needs special handling to ensure values like "256GB" and "512GB" appear
  if (key === 'storage') {
    // Log the first 10 raw storage values to understand the data
    const rawValues = laptops
      .filter(laptop => laptop.storage)
      .map(laptop => laptop.storage)
      .slice(0, 10);
    console.log('Sample raw storage values:', rawValues);
    
    // After normalization, check what values we have
    console.log('Normalized storage values sample:', values.slice(0, 10));
    
    // Make sure we have common storage sizes
    const commonSizes = ['128GB', '256GB', '512GB', '1TB', '2TB'];
    commonSizes.forEach(size => {
      // Check if we have any laptops with this storage size
      const matchingLaptops = laptops.filter(laptop => 
        laptop.storage && laptop.storage.includes(size)
      );
      
      if (matchingLaptops.length > 0 && !values.includes(size)) {
        console.log(`Missing common storage size ${size} found in ${matchingLaptops.length} laptops - adding to filters`);
        values.push(size);
      }
    });
  }
  
  // Sort values using the appropriate sorter
  const sorter = sorterMap[key] || sortDefaultOptions;
  const sortedValues = sorter(values);
  
  // Log filter count
  console.log(`Final ${key} filter count: ${sortedValues.length} options`);

  return new Set(sortedValues);
};
