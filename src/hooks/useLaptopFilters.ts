
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

    // Log total laptops for debugging filter generation
    console.log(`Generating filters from ${laptops.length} laptops`);
    
    // Sample of important fields for debugging
    console.log('Sample laptop fields for filter generation:', 
      laptops.slice(0, 3).map(laptop => ({ 
        id: laptop.id, 
        brand: laptop.brand,
        processor: laptop.processor,
        ram: laptop.ram,
        storage: laptop.storage,
        graphics: laptop.graphics,
        screen: laptop.screen_size
      }))
    );

    // Get all filter options using the helper functions
    const brands = getGroupedBrandValues(laptops, 15);
    const processors = getUniqueFilterValues(laptops, 'processor');
    const ramSizes = getUniqueFilterValues(laptops, 'ram');
    const storageOptions = getUniqueFilterValues(laptops, 'storage');
    const graphicsCards = getUniqueFilterValues(laptops, 'graphics');
    const screenSizes = getUniqueFilterValues(laptops, 'screen_size');
    
    // Log counts for debugging
    console.log('Filter options counts:', {
      brands: brands.size,
      processors: processors.size,
      ramSizes: ramSizes.size,
      storageOptions: storageOptions.size,
      graphicsCards: graphicsCards.size,
      screenSizes: screenSizes.size
    });

    // Log a few sample values from each filter set
    const logSampleValues = (set: Set<string>, name: string) => {
      const values = Array.from(set).slice(0, 5);
      console.log(`Sample ${name} values:`, values);
    };
    
    logSampleValues(brands, 'brand');
    logSampleValues(processors, 'processor');
    logSampleValues(ramSizes, 'RAM');
    logSampleValues(storageOptions, 'storage');
    logSampleValues(graphicsCards, 'graphics');
    logSampleValues(screenSizes, 'screen size');

    return {
      brands,
      processors,
      ramSizes, 
      storageOptions,
      graphicsCards,
      screenSizes,
    };
  }, [laptops]);
};
