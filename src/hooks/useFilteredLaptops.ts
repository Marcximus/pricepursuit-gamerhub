
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
    if (!laptops) {
      return [];
    }

    // Start with all laptops
    let filtered = [...laptops];

    // Only apply filters if they're actively set
    const isFiltering = 
      filters.priceRange.min > 0 || 
      filters.priceRange.max < 10000 ||
      filters.brand !== "all-brands" ||
      filters.processor !== "all-processors" ||
      filters.ram !== "all-ram" ||
      filters.storage !== "all-storage" ||
      filters.graphics !== "all-graphics" ||
      filters.screenSize !== "all-screens";

    if (isFiltering) {
      // Apply price filter
      if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
        filtered = filtered.filter(laptop => {
          const price = laptop.current_price || 0;
          return price >= filters.priceRange.min && price <= filters.priceRange.max;
        });
      }

      // Apply other filters
      if (filters.brand !== "all-brands") {
        filtered = filtered.filter(laptop => 
          laptop.brand?.toLowerCase() === filters.brand.toLowerCase()
        );
      }

      if (filters.processor !== "all-processors") {
        filtered = filtered.filter(laptop => 
          laptop.processor?.toLowerCase() === filters.processor.toLowerCase()
        );
      }

      if (filters.ram !== "all-ram") {
        filtered = filtered.filter(laptop => 
          laptop.ram?.toLowerCase() === filters.ram.toLowerCase()
        );
      }

      if (filters.storage !== "all-storage") {
        filtered = filtered.filter(laptop => 
          laptop.storage?.toLowerCase() === filters.storage.toLowerCase()
        );
      }

      if (filters.graphics !== "all-graphics") {
        filtered = filtered.filter(laptop => 
          laptop.graphics?.toLowerCase() === filters.graphics.toLowerCase()
        );
      }

      if (filters.screenSize !== "all-screens") {
        filtered = filtered.filter(laptop => 
          laptop.screen_size?.toLowerCase() === filters.screenSize.toLowerCase()
        );
      }
    }

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
