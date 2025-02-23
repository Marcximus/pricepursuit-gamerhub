
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";

export const useFilteredLaptops = (
  laptops: Product[] | undefined,
  filters: FilterOptions,
  sortBy: SortOption
) => {
  return useMemo(() => {
    const filterLaptops = (laptops: Product[] | undefined) => {
      if (!laptops) {
        console.log('No laptops to filter');
        return [];
      }

      console.log('Starting filtering process with', laptops.length, 'laptops');
      console.log('Current filters:', filters);
      
      return laptops.filter(laptop => {
        // Price filter - only apply if both min and max are set
        if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
          // Only apply price filter to laptops that have a valid price
          if (laptop.current_price && laptop.current_price > 0) {
            const price = laptop.current_price;
            if (price < filters.priceRange.min || price > filters.priceRange.max) {
              return false;
            }
          }
        }

        // Brand filter
        if (filters.brands.size > 0) {
          if (!laptop.brand || !filters.brands.has(laptop.brand)) {
            return false;
          }
        }
        
        // Processor filter
        if (filters.processors.size > 0) {
          if (!laptop.processor || !filters.processors.has(laptop.processor)) {
            return false;
          }
        }
        
        // RAM filter
        if (filters.ramSizes.size > 0) {
          if (!laptop.ram || !filters.ramSizes.has(laptop.ram)) {
            return false;
          }
        }
        
        // Storage filter
        if (filters.storageOptions.size > 0) {
          if (!laptop.storage || !filters.storageOptions.has(laptop.storage)) {
            return false;
          }
        }
        
        // Graphics filter
        if (filters.graphicsCards.size > 0) {
          if (!laptop.graphics || !filters.graphicsCards.has(laptop.graphics)) {
            return false;
          }
        }
        
        // Screen size filter
        if (filters.screenSizes.size > 0) {
          if (!laptop.screen_size || !filters.screenSizes.has(laptop.screen_size)) {
            return false;
          }
        }
        
        return true;
      });
    };

    return filterLaptops(laptops);
  }, [laptops, filters]);
};
