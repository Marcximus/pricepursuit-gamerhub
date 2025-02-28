
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { matchesFilter } from "./matchers";
import { normalizeBrand } from "@/utils/laptop/valueNormalizer";

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
  const hasActiveFilters = 
    filters.processors.size > 0 || 
    filters.ramSizes.size > 0 ||
    filters.storageOptions.size > 0 ||
    filters.graphicsCards.size > 0 ||
    filters.screenSizes.size > 0 ||
    filters.brands.size > 0 ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 10000;
    
  if (!hasActiveFilters) {
    console.log('No active filters, returning all laptops');
    return laptops;
  }

  const filteredLaptops = laptops.filter(laptop => {
    // Early return if laptop has no title or key specs
    if (!laptop.title || (!laptop.processor && !laptop.ram && !laptop.storage && !laptop.graphics)) {
      return false;
    }
    
    // Always filter out iPads by checking model and title
    if (laptop.model && laptop.model.toLowerCase().includes('ipad')) {
      return false;
    }
    
    if (laptop.title && laptop.title.toLowerCase().includes('ipad')) {
      return false;
    }
    
    // Price Range Filter
    const price = laptop.current_price || 0;
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      return false;
    }

    // Brand Filter
    if (filters.brands.size > 0) {
      // If brand is not specified, exclude when brand filter is active
      if (!laptop.brand && !laptop.title) {
        return false;
      }
      
      const normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title);
      const matchesBrand = Array.from(filters.brands).some(selectedBrand => 
        matchesFilter(selectedBrand, normalizedBrand, 'brand', laptop.title)
      );
      
      if (!matchesBrand) {
        return false;
      }
    }

    // Processor Filter
    if (filters.processors.size > 0) {
      // Exclude laptops with unspecified processors when processor filter is active
      if (!laptop.processor) {
        return false;
      }
      
      const matchesProcessor = Array.from(filters.processors).some(selectedProcessor => 
        matchesFilter(selectedProcessor, laptop.processor, 'processor', laptop.title)
      );
      
      if (!matchesProcessor) {
        return false;
      }
    }

    // RAM Filter
    if (filters.ramSizes.size > 0) {
      // Exclude laptops with unspecified RAM when RAM filter is active
      if (!laptop.ram) {
        return false;
      }
      
      const matchesRam = Array.from(filters.ramSizes).some(selectedRam => 
        matchesFilter(selectedRam, laptop.ram, 'ram', laptop.title)
      );
      
      if (!matchesRam) {
        return false;
      }
    }

    // Storage Filter
    if (filters.storageOptions.size > 0) {
      // Exclude laptops with unspecified storage when storage filter is active
      if (!laptop.storage) {
        return false;
      }
      
      const matchesStorage = Array.from(filters.storageOptions).some(selectedStorage => 
        matchesFilter(selectedStorage, laptop.storage, 'storage', laptop.title)
      );
      
      if (!matchesStorage) {
        return false;
      }
    }

    // Graphics Filter
    if (filters.graphicsCards.size > 0) {
      // Exclude laptops with unspecified graphics when graphics filter is active
      if (!laptop.graphics) {
        return false;
      }
      
      const matchesGraphics = Array.from(filters.graphicsCards).some(selectedGraphics => 
        matchesFilter(selectedGraphics, laptop.graphics, 'graphics', laptop.title)
      );
      
      if (!matchesGraphics) {
        return false;
      }
    }

    // Screen Size Filter
    if (filters.screenSizes.size > 0) {
      // Exclude laptops with unspecified screen size when screen size filter is active
      if (!laptop.screen_size) {
        return false;
      }
      
      const matchesScreenSize = Array.from(filters.screenSizes).some(selectedSize => 
        matchesFilter(selectedSize, laptop.screen_size, 'screen_size', laptop.title)
      );
      
      if (!matchesScreenSize) {
        return false;
      }
    }

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
      graphics: l.graphics,
      model: l.model  // Added model to help debugging
    })));
  }
  
  return filteredLaptops;
};
