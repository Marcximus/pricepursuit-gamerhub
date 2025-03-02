
import { useMemo } from "react";
import type { Product } from "@/types/product";
import { getUniqueFilterValues, getGroupedBrandValues } from "./laptop-filters";

// Cache for filter options to avoid redundant calculations
const filterOptionsCache = new Map<string, any>();
let lastLaptopSetHash = '';

/**
 * Generate a simple hash for the laptop dataset to identify changes
 */
function generateLaptopSetHash(laptops: Product[] | undefined): string {
  if (!laptops || laptops.length === 0) return 'empty';
  return `${laptops.length}_${laptops[0]?.id || ''}_${laptops[laptops.length - 1]?.id || ''}`;
}

/**
 * Hook for generating laptop filter options based on available laptop data
 * with improved caching for better performance
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

    // Generate a hash for the current laptop set
    const currentHash = generateLaptopSetHash(laptops);
    
    // If we have cached filter options for this laptop set, use them
    if (currentHash === lastLaptopSetHash && filterOptionsCache.has('filterOptions')) {
      console.log('Using cached filter options');
      return filterOptionsCache.get('filterOptions');
    }
    
    // Update the hash
    lastLaptopSetHash = currentHash;

    // Skip debug logging in production for better performance
    if (process.env.NODE_ENV !== 'production') {
      // Log sample laptops to check storage values
      console.log('Sample laptop storage values:', 
        laptops.slice(0, 5)
          .map(laptop => ({ 
            id: laptop.id, 
            storage: laptop.storage,
            price: laptop.current_price
          }))
      );
    }

    // Get storage options
    const storageOptions = getUniqueFilterValues(laptops, 'storage');
    
    // Skip debug counting in production for better performance
    if (process.env.NODE_ENV !== 'production') {
      console.log('Generated storage options:', Array.from(storageOptions).slice(0, 10));
    }

    const filterOptions = {
      // Use grouped brands instead of all individual brands
      brands: getGroupedBrandValues(laptops, 15),  // Group brands with fewer than 15 laptops
      processors: getUniqueFilterValues(laptops, 'processor'),
      ramSizes: getUniqueFilterValues(laptops, 'ram'),
      storageOptions: storageOptions,
      graphicsCards: getUniqueFilterValues(laptops, 'graphics'),
      screenSizes: getUniqueFilterValues(laptops, 'screen_size'),
    };
    
    // Cache the filter options
    filterOptionsCache.set('filterOptions', filterOptions);
    
    return filterOptions;
  }, [laptops]);
};
