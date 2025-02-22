
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
    if (!laptops || laptops.length === 0) {
      console.log('No laptops to process, returning empty array');
      return [];
    }

    console.log('Processing laptops:', laptops.length);

    // Only apply price filter if user has explicitly set values
    const filtered = laptops.filter(laptop => {
      if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
        if (!laptop.current_price || laptop.current_price <= 0) {
          return true; // Keep laptops without prices
        }
        if (laptop.current_price < filters.priceRange.min || 
            laptop.current_price > filters.priceRange.max) {
          return false;
        }
      }

      // Only apply other filters if specifically selected
      if (filters.brand !== "all-brands" && 
          laptop.brand?.toLowerCase() !== filters.brand.toLowerCase()) {
        return false;
      }
      
      if (filters.processor !== "all-processors" && 
          laptop.processor?.toLowerCase() !== filters.processor.toLowerCase()) {
        return false;
      }
      
      if (filters.ram !== "all-ram" && 
          laptop.ram?.toLowerCase() !== filters.ram.toLowerCase()) {
        return false;
      }
      
      if (filters.storage !== "all-storage" && 
          laptop.storage?.toLowerCase() !== filters.storage.toLowerCase()) {
        return false;
      }
      
      if (filters.graphics !== "all-graphics" && 
          laptop.graphics?.toLowerCase() !== filters.graphics.toLowerCase()) {
        return false;
      }
      
      if (filters.screenSize !== "all-screens" && 
          laptop.screen_size?.toLowerCase() !== filters.screenSize.toLowerCase()) {
        return false;
      }
      
      return true;
    });

    console.log(`Filtered laptops: ${filtered.length} of ${laptops.length}`);

    // Sort laptops
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.current_price || 0) - (b.current_price || 0);
        case "price-desc":
          return (b.current_price || 0) - (a.current_price || 0);
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "performance-desc":
          return (b.processor_score || 0) - (a.processor_score || 0);
        default:
          return 0;
      }
    });
  }, [laptops, filters, sortBy]);
};
