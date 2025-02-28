import type { Product } from "@/types/product";
import type { FilterableProductKeys } from "@/utils/laptop/filter";
import { 
  getValidValues, 
  normalizerMap, 
  validatorMap 
} from "./filterHelpers";
import { sorterMap, sortDefaultOptions } from "./filterSorters";
import { standardizeProcessorForFiltering } from "@/utils/laptop/filter/extractors/processorExtractor";

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
  
  // Sort values using the appropriate sorter
  const sortedValues = sorter(values);
  
  // Log the sorted values for debugging
  if (sortedValues.length > 0) {
    console.log(`Sorted ${key} filters:`, sortedValues);
  }

  return new Set(sortedValues);
};

/**
 * Gets standardized processor categories for filtering
 */
const getStandardizedProcessorValues = (laptops: Product[]): Set<string> => {
  const processorsSet = new Set<string>();
  
  // Primary processor categories
  const primaryCategories = [
    // Apple
    'Apple M3 Ultra', 'Apple M3 Max', 'Apple M3 Pro', 'Apple M3',
    'Apple M2 Ultra', 'Apple M2 Max', 'Apple M2 Pro', 'Apple M2',
    'Apple M1 Ultra', 'Apple M1 Max', 'Apple M1 Pro', 'Apple M1',
    
    // Intel Core Ultra
    'Intel Core Ultra 9', 'Intel Core Ultra 7', 'Intel Core Ultra 5',
    
    // Intel Core recent gens
    'Intel Core i9 (13th/14th Gen)', 'Intel Core i7 (13th/14th Gen)', 
    'Intel Core i5 (13th/14th Gen)', 'Intel Core i3 (13th/14th Gen)',
    
    // Intel Core previous gens
    'Intel Core i9 (11th/12th Gen)', 'Intel Core i7 (11th/12th Gen)', 
    'Intel Core i5 (11th/12th Gen)', 'Intel Core i3 (11th/12th Gen)',
    
    'Intel Core i9 (10th Gen)', 'Intel Core i7 (10th Gen)', 
    'Intel Core i5 (10th Gen)', 'Intel Core i3 (10th Gen)',
    
    // AMD Ryzen
    'AMD Ryzen 9', 'AMD Ryzen 7', 'AMD Ryzen 5', 'AMD Ryzen 3',
    
    // Budget options
    'Intel Celeron', 'Intel Pentium',
    
    // Mobile processors
    'Qualcomm Snapdragon', 'MediaTek',
    
    // Other
    'Other Processor'
  ];
  
  // Add all standard categories that have at least one matching laptop
  primaryCategories.forEach(category => {
    const hasMatchingLaptop = laptops.some(laptop => {
      const standardized = standardizeProcessorForFiltering(
        laptop.processor || laptop.title
      );
      return standardized === category;
    });
    
    if (hasMatchingLaptop) {
      processorsSet.add(category);
    }
  });
  
  // Always ensure "Other Processor" is available if there are laptops without
  // matching a standard category
  const hasOtherProcessors = laptops.some(laptop => {
    const standardized = standardizeProcessorForFiltering(
      laptop.processor || laptop.title
    );
    return standardized === 'Other Processor';
  });
  
  if (hasOtherProcessors) {
    processorsSet.add('Other Processor');
  }
  
  console.log('Standardized processor categories:', [...processorsSet]);
  
  return processorsSet;
};

/**
 * Groups brands with fewer than the threshold occurrences into an "Other" category
 * and returns only unique brand values, making sure brands in "Other" don't appear individually
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
  const sorter = sorterMap['brand'] || sortDefaultOptions;
  const sortedMainBrands = sorter(mainBrands);
  
  // Add "Other" category if there are any other brands
  if (otherBrands.length > 0) {
    const totalOtherLaptops = otherBrands.reduce((sum, brand) => sum + (brandCounts[brand] || 0), 0);
    console.log(`Grouped ${otherBrands.length} brands with fewer than ${threshold} laptops into "Other" category (${totalOtherLaptops} laptops total)`);
    
    // Log the brands being grouped into "Other" for debugging
    console.log("Brands in Other category:", otherBrands);
    
    sortedMainBrands.push('Other');
  }
  
  return new Set(sortedMainBrands);
};
