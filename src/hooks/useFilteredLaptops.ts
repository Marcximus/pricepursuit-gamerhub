
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
        if (filters.brand !== "all-brands") {
          if (!laptop.brand) return false;
          const laptopBrand = laptop.brand.toLowerCase().trim();
          const selectedBrand = filters.brand.toLowerCase().trim();
          if (laptopBrand !== selectedBrand) return false;
        }
        
        // Processor filter
        if (filters.processor !== "all-processors" && laptop.processor) {
          if (laptop.processor.toLowerCase() !== filters.processor.toLowerCase()) return false;
        }
        
        // RAM filter
        if (filters.ram !== "all-ram" && laptop.ram) {
          if (laptop.ram.toLowerCase() !== filters.ram.toLowerCase()) return false;
        }
        
        // Storage filter
        if (filters.storage !== "all-storage" && laptop.storage) {
          if (laptop.storage.toLowerCase() !== filters.storage.toLowerCase()) return false;
        }
        
        // Graphics filter
        if (filters.graphics !== "all-graphics" && laptop.graphics) {
          if (laptop.graphics.toLowerCase() !== filters.graphics.toLowerCase()) return false;
        }
        
        // Screen size filter
        if (filters.screenSize !== "all-screens" && laptop.screen_size) {
          if (laptop.screen_size.toLowerCase() !== filters.screenSize.toLowerCase()) return false;
        }
        
        return true;
      });
    };

    return filterLaptops(laptops);
  }, [laptops, filters]);
};
