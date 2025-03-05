
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

    // Log total number of laptops being analyzed for filters
    console.log(`Generating filter options from ${laptops.length} laptops`);

    // Get unique brand values and check if "IST" or "Ist computers" appears
    const brands = getGroupedBrandValues(laptops, 15);
    console.log('Generated brand options:', Array.from(brands));
    
    // Check if problematic brands exist in the dataset
    const istBrands = laptops.filter(laptop => {
      const brand = laptop.brand?.toLowerCase() || '';
      return brand.includes('ist') || brand === 'ist computers';
    });
    console.log(`Found ${istBrands.length} laptops with IST/Ist brand`);
    
    if (istBrands.length > 0) {
      // Log a sample of IST laptops to understand what's there
      console.log('Sample IST laptops:', istBrands.slice(0, 3).map(l => ({
        brand: l.brand,
        title: l.title?.substring(0, 50),
        price: l.current_price
      })));
    }

    return {
      // Use grouped brands instead of all individual brands
      brands: brands,  // Group brands with fewer than 15 laptops
      processors: getUniqueFilterValues(laptops, 'processor'),
      ramSizes: getUniqueFilterValues(laptops, 'ram'),
      storageOptions: getUniqueFilterValues(laptops, 'storage'),
      graphicsCards: getUniqueFilterValues(laptops, 'graphics'),
      screenSizes: getUniqueFilterValues(laptops, 'screen_size'),
    };
  }, [laptops]);
};
