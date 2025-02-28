
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
  
  // Sort values using the appropriate sorter
  const sortedValues = sorter(values);
  
  // Log the sorted values for debugging
  if (sortedValues.length > 0) {
    console.log(`Sorted ${key} filters:`, sortedValues);
  }

  return new Set(sortedValues);
};

/**
 * Groups brands with fewer than the threshold occurrences into an "Other" category
 * and returns only unique brand values
 */
export const getGroupedBrandValues = (
  laptops: Product[] | undefined,
  threshold: number = 15
): Set<string> => {
  if (!laptops || laptops.length === 0) {
    return new Set<string>();
  }

  // Get all brand values
  const normalizer = normalizerMap['brand'] || ((val: string) => val.trim());
  const validator = validatorMap['brand'];
  const sorter = sorterMap['brand'] || sortDefaultOptions;
  
  // Count occurrences of each brand
  const brandCounts: Record<string, number> = {};
  
  laptops.forEach(laptop => {
    if (!laptop.brand) return;
    
    const normalizedBrand = normalizer(laptop.brand);
    if (!normalizedBrand || (validator && !validator(normalizedBrand))) return;
    
    brandCounts[normalizedBrand] = (brandCounts[normalizedBrand] || 0) + 1;
  });
  
  // Separate brands into main brands and "Other"
  const mainBrands: string[] = [];
  const otherBrands: string[] = [];
  
  Object.entries(brandCounts).forEach(([brand, count]) => {
    if (count >= threshold) {
      mainBrands.push(brand);
    } else {
      otherBrands.push(brand);
    }
  });
  
  // Sort main brands
  const sortedMainBrands = sorter(mainBrands);
  
  // Add "Other" category if there are any other brands
  if (otherBrands.length > 0) {
    const totalOtherLaptops = otherBrands.reduce((sum, brand) => sum + (brandCounts[brand] || 0), 0);
    console.log(`Grouped ${otherBrands.length} brands with fewer than ${threshold} laptops into "Other" category (${totalOtherLaptops} laptops total)`);
    sortedMainBrands.push('Other');
  }
  
  return new Set(sortedMainBrands);
};
