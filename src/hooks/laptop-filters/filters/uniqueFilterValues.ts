
import type { Product } from "@/types/product";
import type { FilterableProductKeys } from "@/utils/laptop/filter";
import { normalizerMap, validatorMap } from "../helpers/filterHelpers";
import { sorterMap, sortDefaultOptions } from "../helpers/filterSorters";
import { getStandardizedProcessorValues } from "./processorFilterValues";
import { getValidValues } from "../helpers/filterUtils";
import { getGraphicsFilterValue } from "@/utils/laptop/normalizers/graphics/filters";

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
  
  // Special handling for graphics cards 
  if (key === 'graphics') {
    // Create standardized graphics categories from raw values
    const graphicsCategories = new Set<string>();
    const categoryCount = new Map<string, number>();
    
    // Process each laptop to categorize its graphics
    laptops.forEach(laptop => {
      if (!laptop.graphics) return;
      
      // Get the standardized category for this graphics card
      const category = getGraphicsFilterValue(laptop.graphics);
      if (!category) return;
      
      // Count occurrences of each category
      const currentCount = categoryCount.get(category) || 0;
      categoryCount.set(category, currentCount + 1);
    });
    
    // Define primary graphics categories that should always be shown if present
    const primaryGraphicsCategories = [
      // NVIDIA RTX 40 series
      'NVIDIA RTX 4090', 'NVIDIA RTX 4080', 'NVIDIA RTX 4070', 
      'NVIDIA RTX 4060', 'NVIDIA RTX 4050',
      
      // NVIDIA RTX 30 series
      'NVIDIA RTX 3090', 'NVIDIA RTX 3080', 'NVIDIA RTX 3070', 
      'NVIDIA RTX 3060', 'NVIDIA RTX 3050',
      
      // NVIDIA RTX 20 series
      'NVIDIA RTX 2080', 'NVIDIA RTX 2070', 'NVIDIA RTX 2060',
      
      // NVIDIA GTX series - Add specific models
      'NVIDIA GTX 1660', 'NVIDIA GTX 1650', 'NVIDIA GTX 1060', 'NVIDIA GTX 1070', 'NVIDIA GTX 1080',
      
      // NVIDIA MX series
      'NVIDIA MX 550', 'NVIDIA MX 450', 'NVIDIA MX 350', 'NVIDIA MX 250',
      
      // AMD Radeon
      'AMD Radeon RX 7900', 'AMD Radeon RX 7800', 'AMD Radeon RX 7700', 'AMD Radeon RX 7600',
      'AMD Radeon RX 6800', 'AMD Radeon RX 6700', 'AMD Radeon RX 6600', 'AMD Radeon RX 6500',
      'AMD Radeon RX 5700', 'AMD Radeon RX 5600', 'AMD Radeon RX 5500',
      'AMD Radeon Vega',
      
      // Intel Arc discrete
      'Intel Arc A770', 'Intel Arc A750', 'Intel Arc A380',
      
      // Intel Integrated (more detailed categories) - COMBINED Iris Xe and regular Iris
      'Intel Iris Graphics', // Combined category instead of separate Iris Xe and Iris
      'Intel Iris Plus Graphics',
      'Intel UHD Graphics 700 Series',
      'Intel UHD Graphics 600 Series', 
      'Intel UHD Graphics',
      'Intel HD Graphics 500 Series',
      'Intel HD Graphics 400 Series',
      'Intel HD Graphics 300 Series',
      'Intel HD Graphics 200 Series',
      'Intel HD Graphics',
      
      // Apple
      'Apple M3 Ultra GPU', 'Apple M3 Max GPU', 'Apple M3 Pro GPU', 'Apple M3 GPU',
      'Apple M2 Ultra GPU', 'Apple M2 Max GPU', 'Apple M2 Pro GPU', 'Apple M2 GPU',
      'Apple M1 Ultra GPU', 'Apple M1 Max GPU', 'Apple M1 Pro GPU', 'Apple M1 GPU',
      
      // Generic categories
      'NVIDIA RTX Graphics', 'NVIDIA GTX Graphics', 'NVIDIA Graphics',
      'AMD Radeon Graphics',
      'Intel Graphics',
      'Apple Graphics',
      'High Performance GPU', 'Integrated GPU', 'Dedicated GPU',
      
      // Others
      'Other Graphics'
    ];
    
    // Add categories with at least one match to the set, filtering out rare options
    const MINIMUM_COUNT_THRESHOLD = 3;  // Lower threshold to include more specific categories
    let hasRareOptions = false;
    
    primaryGraphicsCategories.forEach(category => {
      const count = categoryCount.get(category) || 0;
      if (count >= MINIMUM_COUNT_THRESHOLD) {
        graphicsCategories.add(category);
      } else if (count > 0) {
        hasRareOptions = true;
      }
    });
    
    // Add the "Other Graphics" option if there are any rare models
    if (hasRareOptions) {
      graphicsCategories.add('Other Graphics');
    }
    
    // Log the categorization results
    console.log(`Generated ${graphicsCategories.size} graphics filter categories`);
    
    // Return the categories set without further sorting (they're already in priority order)
    return graphicsCategories;
  }
  
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
