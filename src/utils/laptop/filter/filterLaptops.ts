
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { 
  applyBrandFilter, 
  applyPriceFilter,
  applyProcessorFilter,
  applyRamFilter,
  applyStorageFilter,
  applyGraphicsFilter,
  applyScreenSizeFilter,
  hasActiveFilters
} from "./filtering";

/**
 * Filters laptops based on selected filter options with improved validation
 */
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

  // Skip filtering if no filters are applied
  if (!hasActiveFilters(filters)) {
    console.log('No active filters, returning all laptops');
    return laptops;
  }

  // Create a set of major brands to assist with "Other" category filtering
  const mainBrandsSet = new Set<string>();
  
  // If filters contain brands, collect all non-Other brand filters for exclusion
  if (filters.brands.size > 0) {
    filters.brands.forEach(brand => {
      if (brand !== 'Other') {
        mainBrandsSet.add(brand.toLowerCase());
      }
    });
  }

  const filteredLaptops = laptops.filter(laptop => {
    // Early return if laptop has no title or key specs
    if (!laptop.title || (!laptop.processor && !laptop.ram && !laptop.storage && !laptop.graphics)) {
      return false;
    }
    
    // Apply all filters in sequence (price first as it's fastest to check)
    if (!applyPriceFilter(laptop, filters)) return false;
    if (!applyBrandFilter(laptop, filters, mainBrandsSet)) return false;
    if (!applyProcessorFilter(laptop, filters)) return false;
    if (!applyRamFilter(laptop, filters)) return false;
    if (!applyStorageFilter(laptop, filters)) return false;
    if (!applyGraphicsFilter(laptop, filters)) return false;
    if (!applyScreenSizeFilter(laptop, filters)) return false;

    return true;
  });

  console.log(`Filtering complete: ${filteredLaptops.length} out of ${laptops.length} laptops matched filters`);
  
  // Log a sample of filtered laptops for debugging
  if (filteredLaptops.length > 0) {
    console.log('Sample of matching laptops:', filteredLaptops.slice(0, 3).map(l => ({
      title: l.title?.substring(0, 50) + '...',
      price: l.current_price,
      brand: l.brand,
      ram: l.ram,
      storage: l.storage,
      processor: l.processor,
      screen_size: l.screen_size,
      graphics: l.graphics
    })));
  }
  
  return filteredLaptops;
};
