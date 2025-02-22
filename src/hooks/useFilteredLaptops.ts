
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
      
      const filtered = laptops.filter(laptop => {
        // Price filter - only apply if both min and max are set
        if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
          // Only apply price filter to laptops that have a valid price
          if (laptop.current_price && laptop.current_price > 0) {
            const price = laptop.current_price;
            if (price < filters.priceRange.min || price > filters.priceRange.max) {
              console.log(`Laptop ${laptop.title} filtered out by price range:`, { price, min: filters.priceRange.min, max: filters.priceRange.max });
              return false;
            }
          }
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
            console.log(`Processor mismatch - Laptop: "${laptop.processor}", Filter: "${filters.processor}"`);
            return false;
          }
        }
        
        // RAM filter
        if (filters.ram !== "all-ram" && laptop.ram) {
          const ramMatches = laptop.ram.toLowerCase() === filters.ram.toLowerCase();
          if (!ramMatches) {
            console.log(`RAM mismatch - Laptop: "${laptop.ram}", Filter: "${filters.ram}"`);
            return false;
          }
        }
        
        // Storage filter
        if (filters.storage !== "all-storage" && laptop.storage) {
          const storageMatches = laptop.storage.toLowerCase() === filters.storage.toLowerCase();
          if (!storageMatches) {
            console.log(`Storage mismatch - Laptop: "${laptop.storage}", Filter: "${filters.storage}"`);
            return false;
          }
        }
        
        // Graphics filter
        if (filters.graphics !== "all-graphics" && laptop.graphics) {
          const graphicsMatches = laptop.graphics.toLowerCase() === filters.graphics.toLowerCase();
          if (!graphicsMatches) {
            console.log(`Graphics mismatch - Laptop: "${laptop.graphics}", Filter: "${filters.graphics}"`);
            return false;
          }
        }
        
        // Screen size filter
        if (filters.screenSize !== "all-screens" && laptop.screen_size) {
          const screenSizeMatches = laptop.screen_size.toLowerCase() === filters.screenSize.toLowerCase();
          if (!screenSizeMatches) {
            console.log(`Screen size mismatch - Laptop: "${laptop.screen_size}", Filter: "${filters.screenSize}"`);
            return false;
          }
        }
        
        return true;
      });

      console.log(`Filtering complete: ${laptops.length} → ${filtered.length} laptops`);
      console.log('Filter breakdown:', {
        totalStart: laptops.length,
        totalAfterFilter: filtered.length,
        filterSettings: filters,
      });
      
      return filtered;
    };

    const sortLaptops = (laptops: Product[] | undefined) => {
      if (!laptops) {
        console.log('No laptops to sort');
        return [];
      }
      
      console.log(`Starting sort of ${laptops.length} laptops by ${sortBy}`);
      
      const sorted = [...laptops].sort((a, b) => {
        // First check if either laptop has no price
        const aHasPrice = a.current_price && a.current_price > 0;
        const bHasPrice = b.current_price && b.current_price > 0;
        
        switch (sortBy) {
          case "price-asc":
            // If neither has a price, maintain their order
            if (!aHasPrice && !bHasPrice) return 0;
            // If only one has a price, put the one with price first
            if (aHasPrice && !bHasPrice) return -1;
            if (!aHasPrice && bHasPrice) return 1;
            // If both have prices, sort by price
            return (a.current_price || 0) - (b.current_price || 0);
          case "price-desc":
            if (!aHasPrice && !bHasPrice) return 0;
            if (aHasPrice && !bHasPrice) return -1;
            if (!aHasPrice && bHasPrice) return 1;
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

      console.log(`Sorting complete. Final laptop count: ${sorted.length}`);
      return sorted;
    };

    return sortLaptops(filterLaptops(laptops));
  }, [laptops, filters, sortBy]);
};
