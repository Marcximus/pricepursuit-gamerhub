
import { useMemo } from "react";
import type { Product } from "@/types/product";

type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

export const useLaptopFilters = (laptops: Product[] | undefined, allFilteredLaptops?: Product[]) => {
  return useMemo(() => {
    // Use allFilteredLaptops for filter options if available, otherwise fall back to laptops
    const datasetForFilters = allFilteredLaptops || laptops;

    const getUniqueValues = (key: FilterableProductKeys) => {
      if (!datasetForFilters || datasetForFilters.length === 0) {
        console.log(`No laptops available for ${key} filter`);
        return new Set<string>();
      }
      
      // Filter out null/undefined/empty values and normalize strings
      const validValues = datasetForFilters
        .map(laptop => {
          const value = laptop[key];
          if (key === 'graphics') {
            console.log('Raw graphics value:', value, 'from laptop:', laptop.title);
          }
          return value;
        })
        .filter((value): value is string => {
          const isValid = value != null && 
            typeof value === 'string' && 
            value.trim() !== '';
          if (key === 'graphics' && !isValid) {
            console.log('Filtered out invalid graphics value:', value);
          }
          return isValid;
        })
        .map(value => value.trim());

      // Create a unique set of values and sort them
      const uniqueValues = Array.from(new Set(validValues)).sort((a, b) => {
        // Custom sort for graphics cards to group by manufacturer
        if (key === 'graphics') {
          const manufacturers = ['NVIDIA', 'AMD', 'Intel'];
          const aManuf = manufacturers.find(m => a.includes(m)) || '';
          const bManuf = manufacturers.find(m => b.includes(m)) || '';
          if (aManuf !== bManuf) {
            return manufacturers.indexOf(aManuf) - manufacturers.indexOf(bManuf);
          }
        }
        return a.localeCompare(b);
      });
      
      console.log(`Generated ${key} filter options:`, {
        total: uniqueValues.length,
        values: uniqueValues,
        datasetSize: datasetForFilters.length
      });
      
      return new Set(uniqueValues);
    };

    // Generate all possible filter options from the complete filtered dataset
    const filterOptions = {
      processors: getUniqueValues('processor'),
      ramSizes: getUniqueValues('ram'),
      storageOptions: getUniqueValues('storage'),
      graphicsCards: getUniqueValues('graphics'),
      screenSizes: getUniqueValues('screen_size'),
      brands: getUniqueValues('brand'),
    };

    console.log('Generated all filter options:', {
      totalLaptops: datasetForFilters?.length,
      brands: Array.from(filterOptions.brands).length,
      processors: Array.from(filterOptions.processors).length,
      ram: Array.from(filterOptions.ramSizes).length,
      storage: Array.from(filterOptions.storageOptions).length,
      graphics: Array.from(filterOptions.graphicsCards).length,
      screenSizes: Array.from(filterOptions.screenSizes).length
    });

    return filterOptions;
  }, [laptops, allFilteredLaptops]);
};

