
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

export const filterLaptops = (laptops: Product[], filters: FilterOptions): Product[] => {
  console.log('Starting filtering with:', {
    totalLaptops: laptops.length,
    activeFilters: {
      priceRange: filters.priceRange,
      processors: filters.processors.size,
      ram: filters.ramSizes.size,
      storage: filters.storageOptions.size,
      graphics: filters.graphicsCards.size,
      screenSizes: filters.screenSizes.size,
      brands: filters.brands.size
    }
  });

  return laptops.filter(laptop => {
    // Price Range Filter
    const price = laptop.current_price || 0;
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      return false;
    }

    // Brand Filter
    if (filters.brands.size > 0 && laptop.brand) {
      if (!filters.brands.has(laptop.brand)) {
        return false;
      }
    }

    // Processor Filter
    if (filters.processors.size > 0 && laptop.processor) {
      if (!Array.from(filters.processors).some(p => laptop.processor?.includes(p))) {
        return false;
      }
    }

    // RAM Filter
    if (filters.ramSizes.size > 0 && laptop.ram) {
      if (!Array.from(filters.ramSizes).some(r => laptop.ram?.includes(r))) {
        return false;
      }
    }

    // Storage Filter
    if (filters.storageOptions.size > 0 && laptop.storage) {
      if (!Array.from(filters.storageOptions).some(s => laptop.storage?.includes(s))) {
        return false;
      }
    }

    // Graphics Filter
    if (filters.graphicsCards.size > 0 && laptop.graphics) {
      if (!Array.from(filters.graphicsCards).some(g => laptop.graphics?.includes(g))) {
        return false;
      }
    }

    // Screen Size Filter
    if (filters.screenSizes.size > 0 && laptop.screen_size) {
      if (!Array.from(filters.screenSizes).some(s => laptop.screen_size?.includes(s))) {
        return false;
      }
    }

    return true;
  });
};
