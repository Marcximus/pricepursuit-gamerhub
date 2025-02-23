
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

const fetchAllLaptopsForFilters = async () => {
  const { data: laptops, error } = await supabase
    .from('products')
    .select('processor, ram, storage, graphics, screen_size, brand')
    .eq('is_laptop', true);

  if (error) {
    console.error('Error fetching laptops for filters:', error);
    throw error;
  }

  return laptops;
};

export const useLaptopFilters = (displayedLaptops: Product[] | undefined) => {
  // Fetch all laptops for filter generation
  const { data: allLaptops } = useQuery({
    queryKey: ['laptops-filters'],
    queryFn: fetchAllLaptopsForFilters,
  });

  return useMemo(() => {
    const getUniqueValues = (key: FilterableProductKeys) => {
      if (!allLaptops || allLaptops.length === 0) {
        console.log(`No laptops available for ${key} filter`);
        return new Set<string>();
      }
      
      // Filter out null/undefined/empty values and normalize strings
      const validValues = allLaptops
        .map(laptop => laptop[key])
        .filter((value): value is string => 
          value != null && 
          typeof value === 'string' && 
          value.trim() !== ''
        )
        .map(value => value.trim());

      // Create a unique set of values
      const uniqueValues = Array.from(new Set(validValues)).sort();
      
      console.log(`Generated ${key} filter options:`, {
        total: uniqueValues.length,
        values: uniqueValues
      });
      
      return new Set(uniqueValues);
    };

    const filterOptions = {
      processors: getUniqueValues('processor'),
      ramSizes: getUniqueValues('ram'),
      storageOptions: getUniqueValues('storage'),
      graphicsCards: getUniqueValues('graphics'),
      screenSizes: getUniqueValues('screen_size'),
      brands: getUniqueValues('brand'),
    };

    console.log('Generated all filter options:', {
      totalLaptops: allLaptops?.length,
      brands: Array.from(filterOptions.brands),
      totalBrands: filterOptions.brands.size,
      processors: Array.from(filterOptions.processors).length,
      ram: Array.from(filterOptions.ramSizes).length,
      storage: Array.from(filterOptions.storageOptions).length,
      graphics: Array.from(filterOptions.graphicsCards).length,
      screenSizes: Array.from(filterOptions.screenSizes).length
    });

    return filterOptions;
  }, [allLaptops]);
};
