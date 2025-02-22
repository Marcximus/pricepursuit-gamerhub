
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
    // Important: If we have no laptops, just return undefined to indicate loading
    if (!laptops) {
      return undefined;
    }

    console.log('Processing laptops:', {
      total: laptops.length,
      filters,
      sortBy
    });

    // Start with all laptops
    let filtered = [...laptops];

    // Only apply filters if user has made explicit selections
    const hasActiveFilters = 
      filters.priceRange.min > 0 || 
      filters.priceRange.max < 10000 ||
      filters.brand !== "all-brands" ||
      filters.processor !== "all-processors" ||
      filters.ram !== "all-ram" ||
      filters.storage !== "all-storage" ||
      filters.graphics !== "all-graphics" ||
      filters.screenSize !== "all-screens";

    if (hasActiveFilters) {
      filtered = laptops.filter(laptop => {
        // Only apply price filter if explicitly set
        if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
          if (laptop.current_price && 
              (laptop.current_price < filters.priceRange.min || 
               laptop.current_price > filters.priceRange.max)) {
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
    }

    console.log(`After filtering: ${filtered.length} of ${laptops.length} laptops`);

    // Sort laptops
    return filtered.sort((a, b) => {
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
