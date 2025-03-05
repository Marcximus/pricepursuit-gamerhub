
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
import { normalizeBrand } from "@/utils/laptop/valueNormalizer";
import { extractProcessorFromTitle } from "./extractors/processor/processorExtractor";

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

  // Create a set of major brands (brands with 15+ items)
  const mainBrandsSet = new Set<string>();
  
  // Count occurrences of each brand
  const brandCounts: Record<string, number> = {};
  
  laptops.forEach(laptop => {
    if (!laptop.brand && !laptop.title) return;
    
    const normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title).toLowerCase();
    brandCounts[normalizedBrand] = (brandCounts[normalizedBrand] || 0) + 1;
  });
  
  // Populate mainBrandsSet with brands that have 15+ laptops
  Object.entries(brandCounts).forEach(([brand, count]) => {
    if (count >= 15) {
      mainBrandsSet.add(brand.toLowerCase());
    }
  });
  
  // Add any explicitly selected brands (except 'Other') to mainBrandsSet
  filters.brands.forEach(brand => {
    if (brand !== 'Other') {
      mainBrandsSet.add(brand.toLowerCase());
    }
  });

  console.log('Main brands set:', mainBrandsSet);

  // Pre-extract processors for all laptops to improve filtering performance
  const processorsCache = new Map<string, string>();
  laptops.forEach(laptop => {
    if (laptop.id) {
      const extractedProcessor = extractProcessorFromTitle(laptop.title, laptop.processor);
      if (extractedProcessor) {
        processorsCache.set(laptop.id, extractedProcessor);
      }
    }
  });

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
      extractedProcessor: l.id ? processorsCache.get(l.id) : undefined,
      screen_size: l.screen_size,
      graphics: l.graphics
    })));
  }
  
  return filteredLaptops;
};
