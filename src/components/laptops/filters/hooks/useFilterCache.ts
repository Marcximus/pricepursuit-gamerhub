
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions } from "../types";

/**
 * Custom hook that provides a global filter cache to avoid redundant calculations
 * This significantly improves performance by caching intermediate results
 */
export const useFilterCache = (
  allLaptops: Product[],
  filters: FilterOptions
) => {
  return useMemo(() => {
    // Skip calculation if no laptops
    if (!allLaptops || allLaptops.length === 0) {
      return null;
    }

    // Index laptops by their key properties for quick lookups
    const laptopsByBrand = new Map<string, Product[]>();
    const laptopsByProcessor = new Map<string, Product[]>();
    const laptopsByRam = new Map<string, Product[]>();
    const laptopsByStorage = new Map<string, Product[]>();
    const laptopsByGraphics = new Map<string, Product[]>();
    const laptopsByScreenSize = new Map<string, Product[]>();
    
    // Build indices for fast lookups
    allLaptops.forEach(laptop => {
      // Only process laptops in the price range to avoid unnecessary work
      if (laptop.current_price < filters.priceRange.min || 
          laptop.current_price > filters.priceRange.max) {
        return;
      }
      
      // Index by brand
      if (laptop.brand) {
        const brand = laptop.brand.toLowerCase();
        if (!laptopsByBrand.has(brand)) {
          laptopsByBrand.set(brand, []);
        }
        laptopsByBrand.get(brand)?.push(laptop);
      }
      
      // Index by processor
      if (laptop.processor) {
        const processor = laptop.processor.toLowerCase();
        if (!laptopsByProcessor.has(processor)) {
          laptopsByProcessor.set(processor, []);
        }
        laptopsByProcessor.get(processor)?.push(laptop);
      }
      
      // Index by RAM
      if (laptop.ram) {
        const ram = laptop.ram.toLowerCase();
        if (!laptopsByRam.has(ram)) {
          laptopsByRam.set(ram, []);
        }
        laptopsByRam.get(ram)?.push(laptop);
      }
      
      // Index by storage
      if (laptop.storage) {
        const storage = laptop.storage.toLowerCase();
        if (!laptopsByStorage.has(storage)) {
          laptopsByStorage.set(storage, []);
        }
        laptopsByStorage.get(storage)?.push(laptop);
      }
      
      // Index by graphics
      if (laptop.graphics) {
        const graphics = laptop.graphics.toLowerCase();
        if (!laptopsByGraphics.has(graphics)) {
          laptopsByGraphics.set(graphics, []);
        }
        laptopsByGraphics.get(graphics)?.push(laptop);
      }
      
      // Index by screen size
      if (laptop.screen_size) {
        const screenSize = laptop.screen_size.toLowerCase();
        if (!laptopsByScreenSize.has(screenSize)) {
          laptopsByScreenSize.set(screenSize, []);
        }
        laptopsByScreenSize.get(screenSize)?.push(laptop);
      }
    });
    
    return {
      laptopsByBrand,
      laptopsByProcessor,
      laptopsByRam,
      laptopsByStorage,
      laptopsByGraphics,
      laptopsByScreenSize,
    };
  }, [allLaptops, filters.priceRange.min, filters.priceRange.max]);
};
