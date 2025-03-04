
import { useMemo } from "react";
import type { Product } from "@/types/product";
import { getUniqueFilterValues, getGroupedBrandValues } from "./laptop-filters";

/**
 * Hook for generating laptop filter options based on available laptop data
 */
export const useLaptopFilters = (laptops: Product[] | undefined) => {
  return useMemo(() => {
    if (!laptops || laptops.length === 0) {
      console.log('No laptops available for generating filter options');
      return {
        brands: new Set<string>(),        // First - most important
        processors: new Set<string>(),    // Second - key spec
        ramSizes: new Set<string>(),      // Third - key spec
        storageOptions: new Set<string>(), // Fourth - key spec
        graphicsCards: new Set<string>(),  // Fifth - key spec
        screenSizes: new Set<string>(),    // Last - less critical
      };
    }

    // Log sample laptops to check storage values
    console.log('Sample laptop storage values:', 
      laptops.slice(0, 10)
        .map(laptop => ({ 
          id: laptop.id, 
          storage: laptop.storage,
          price: laptop.current_price
        }))
    );

    // Get storage options and log them to debug the issue
    const storageOptions = getUniqueFilterValues(laptops, 'storage');
    console.log('Generated storage options:', Array.from(storageOptions));

    // Count laptops with storage between 100-199 GB
    const laptopsWith100To199GB = laptops.filter(laptop => {
      if (!laptop.storage) return false;
      const storageMatch = laptop.storage.match(/(\d+)\s*(GB|TB|gb|tb)/i);
      if (!storageMatch) return false;
      
      const value = parseInt(storageMatch[1], 10);
      const unit = storageMatch[2].toLowerCase();
      const gbValue = unit === 'tb' ? value * 1024 : value;
      
      return gbValue >= 100 && gbValue < 200;
    });
    
    console.log(`Found ${laptopsWith100To199GB.length} laptops with storage between 100-199 GB`);
    if (laptopsWith100To199GB.length > 0) {
      console.log('Sample of 100-199 GB laptops:', 
        laptopsWith100To199GB.slice(0, 5)
          .map(laptop => ({ id: laptop.id, storage: laptop.storage }))
      );
    }

    return {
      // Use grouped brands instead of all individual brands
      brands: getGroupedBrandValues(laptops, 15),  // Group brands with fewer than 15 laptops
      processors: getUniqueFilterValues(laptops, 'processor'),
      ramSizes: getUniqueFilterValues(laptops, 'ram'),
      storageOptions: storageOptions,
      graphicsCards: getUniqueFilterValues(laptops, 'graphics'),
      screenSizes: getUniqueFilterValues(laptops, 'screen_size'),
    };
  }, [laptops]);
};
