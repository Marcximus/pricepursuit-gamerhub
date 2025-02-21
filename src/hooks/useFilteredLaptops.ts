
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
      
      const filtered = laptops.filter(laptop => {
        // Price filter
        const price = laptop.current_price || 0;
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }

        // Brand filter
        if (filters.brand !== "all-brands") {
          if (!laptop.brand) {
            console.log('Laptop has no brand:', laptop.title);
            return false;
          }
          const laptopBrand = laptop.brand.toLowerCase().trim();
          const selectedBrand = filters.brand.toLowerCase().trim();
          const brandMatches = laptopBrand === selectedBrand;
          
          if (!brandMatches) {
            console.log(`Brand mismatch - Laptop: "${laptopBrand}", Filter: "${selectedBrand}"`);
            return false;
          }
        }
        
        // Processor filter
        if (filters.processor !== "all-processors" && laptop.processor) {
          const processorMatches = laptop.processor.toLowerCase() === filters.processor.toLowerCase();
          if (!processorMatches) {
            return false;
          }
        }
        
        // RAM filter
        if (filters.ram !== "all-ram" && laptop.ram) {
          const ramMatches = laptop.ram.toLowerCase() === filters.ram.toLowerCase();
          if (!ramMatches) {
            return false;
          }
        }
        
        // Storage filter
        if (filters.storage !== "all-storage" && laptop.storage) {
          const storageMatches = laptop.storage.toLowerCase() === filters.storage.toLowerCase();
          if (!storageMatches) {
            return false;
          }
        }
        
        // Graphics filter
        if (filters.graphics !== "all-graphics" && laptop.graphics) {
          const graphicsMatches = laptop.graphics.toLowerCase() === filters.graphics.toLowerCase();
          if (!graphicsMatches) {
            return false;
          }
        }
        
        // Screen size filter
        if (filters.screenSize !== "all-screens" && laptop.screen_size) {
          const screenSizeMatches = laptop.screen_size.toLowerCase() === filters.screenSize.toLowerCase();
          if (!screenSizeMatches) {
            return false;
          }
        }
        
        return true;
      });

      console.log(`Filtered from ${laptops.length} to ${filtered.length} laptops`);
      return filtered;
    };

    const sortLaptops = (laptops: Product[] | undefined) => {
      if (!laptops) {
        console.log('No laptops to sort');
        return [];
      }
      
      const sorted = [...laptops].sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return (a.current_price || 0) - (b.current_price || 0);
          case "price-desc":
            return (b.current_price || 0) - (a.current_price || 0);
          case "rating-desc":
            return ((b.rating || 0) * (b.rating_count || 0)) - 
                   ((a.rating || 0) * (a.rating_count || 0));
          case "performance-desc":
            return (b.processor_score || 0) - (a.processor_score || 0);
          default:
            return 0;
        }
      });

      console.log(`Sorted ${sorted.length} laptops by ${sortBy}`);
      return sorted;
    };

    return sortLaptops(filterLaptops(laptops));
  }, [laptops, filters, sortBy]);
};
