
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

// Cache for normalizedBrands to avoid redundant normalization
const brandCache = new Map<string, string>();
// Cache for processor extraction results
const processorCache = new Map<string, string>();

/**
 * Filters laptops based on selected filter options with improved performance
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

  // Apply price filter first (fastest) if active
  let filteredLaptops = filters.priceRange.min > 0 || filters.priceRange.max < 10000
    ? laptops.filter(laptop => applyPriceFilter(laptop, filters))
    : laptops;

  // Create a set of major brands (brands with 15+ items)
  const mainBrandsSet = new Set<string>();
  
  // Determine if brand filtering is needed
  const needsBrandFiltering = filters.brands.size > 0;
  
  // Only compute brand counts if brand filtering is active
  if (needsBrandFiltering) {
    // Count occurrences of each brand
    const brandCounts: Record<string, number> = {};
    
    filteredLaptops.forEach(laptop => {
      if (!laptop.brand && !laptop.title) return;
      
      // Use cached brand normalization for better performance
      const cacheKey = `${laptop.brand || ''}-${laptop.title || ''}`;
      let normalizedBrand = brandCache.get(cacheKey);
      
      if (!normalizedBrand) {
        normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title).toLowerCase();
        brandCache.set(cacheKey, normalizedBrand);
      }
      
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
    
    // Apply brand filter if needed
    filteredLaptops = filteredLaptops.filter(laptop => 
      applyBrandFilter(laptop, filters, mainBrandsSet)
    );
  }

  // Apply remaining filters more efficiently using progressive filtering
  // Order matters: apply most restrictive/fastest filters first
  const activeFilters = [];
  
  if (filters.processors.size > 0)     activeFilters.push((l: Product) => applyProcessorFilter(l, filters));
  if (filters.ramSizes.size > 0)        activeFilters.push((l: Product) => applyRamFilter(l, filters));
  if (filters.storageOptions.size > 0)  activeFilters.push((l: Product) => applyStorageFilter(l, filters));
  if (filters.graphicsCards.size > 0)   activeFilters.push((l: Product) => applyGraphicsFilter(l, filters));
  if (filters.screenSizes.size > 0)     activeFilters.push((l: Product) => applyScreenSizeFilter(l, filters));
  
  // Apply each active filter in sequence, reducing the dataset each time
  for (const filterFn of activeFilters) {
    filteredLaptops = filteredLaptops.filter(filterFn);
  }

  console.log(`Filtering complete: ${filteredLaptops.length} out of ${laptops.length} laptops matched filters`);
  
  return filteredLaptops;
};
