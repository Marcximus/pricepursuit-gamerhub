
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

export const filterLaptops = (laptops: Product[], filters: FilterOptions): Product[] => {
  return laptops.filter(laptop => {
    if (filters.brands.size > 0 && !filters.brands.has(laptop.brand)) return false;
    if (filters.processors.size > 0 && !filters.processors.has(laptop.processor || '')) return false;
    if (filters.ramSizes.size > 0 && !filters.ramSizes.has(laptop.ram || '')) return false;
    if (filters.storageOptions.size > 0 && !filters.storageOptions.has(laptop.storage || '')) return false;
    if (filters.graphicsCards.size > 0 && !filters.graphicsCards.has(laptop.graphics || '')) return false;
    if (filters.screenSizes.size > 0 && !filters.screenSizes.has(laptop.screen_size || '')) return false;
    
    const price = laptop.current_price || 0;
    if (filters.priceRange.min > 0 && price < filters.priceRange.min) return false;
    if (filters.priceRange.max < 10000 && price > filters.priceRange.max) return false;
    
    return true;
  });
};
