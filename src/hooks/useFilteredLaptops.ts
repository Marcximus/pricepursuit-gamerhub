
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
        const price = laptop.current_price || 0;
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          console.log(`Laptop ${laptop.title} filtered out due to price ${price}`);
          return false;
        }
        
        if (filters.processor !== "all-processors" && laptop.processor && 
            !laptop.processor.toLowerCase().includes(filters.processor.toLowerCase())) {
          console.log(`Laptop ${laptop.title} filtered out due to processor ${laptop.processor}`);
          return false;
        }
        
        if (filters.ram !== "all-ram" && laptop.ram && 
            !laptop.ram.toLowerCase().includes(filters.ram.toLowerCase())) {
          console.log(`Laptop ${laptop.title} filtered out due to RAM ${laptop.ram}`);
          return false;
        }
        
        if (filters.storage !== "all-storage" && laptop.storage && 
            !laptop.storage.toLowerCase().includes(filters.storage.toLowerCase())) {
          console.log(`Laptop ${laptop.title} filtered out due to storage ${laptop.storage}`);
          return false;
        }
        
        if (filters.graphics !== "all-graphics" && laptop.graphics && 
            !laptop.graphics.toLowerCase().includes(filters.graphics.toLowerCase())) {
          console.log(`Laptop ${laptop.title} filtered out due to graphics ${laptop.graphics}`);
          return false;
        }
        
        if (filters.screenSize !== "all-screens" && laptop.screen_size && 
            !laptop.screen_size.toLowerCase().includes(filters.screenSize.toLowerCase())) {
          console.log(`Laptop ${laptop.title} filtered out due to screen size ${laptop.screen_size}`);
          return false;
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

