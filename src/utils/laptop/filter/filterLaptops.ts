
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
import { normalizeBrand } from "@/utils/laptop/normalizers/brandNormalizer";
import { extractProcessorFromTitle } from "./extractors/processor/processorExtractor";

// Cache for brand normalization
const brandCache = new Map<string, string>();

// Cache for processor extraction
const processorCache = new Map<string, string>();

/**
 * Filters laptops based on selected filter options with improved performance
 */
export const filterLaptops = (laptops: Product[], filters: FilterOptions): Product[] => {
  // Log filter state at the start
  console.log('Starting filtering with:', {
    totalLaptops: laptops.length,
    activeFilters: {
      priceRange: filters.priceRange,
      processors: filters.processors.size > 0 ? Array.from(filters.processors) : 'none',
      ram: filters.ramSizes.size > 0 ? Array.from(filters.ramSizes) : 'none',
      storage: filters.storageOptions.size > 0 ? Array.from(filters.storageOptions) : 'none',
      graphics: filters.graphicsCards.size > 0 ? Array.from(filters.graphicsCards) : 'none',
      screenSizes: filters.screenSizes.size > 0 ? Array.from(filters.screenSizes) : 'none',
      brands: filters.brands.size > 0 ? Array.from(filters.brands) : 'none'
    }
  });

  // Skip filtering if no filters are applied
  if (!hasActiveFilters(filters)) {
    console.log('No active filters, returning all laptops');
    return laptops;
  }

  // Create a set of major brands (brands with 15+ items)
  const mainBrandsSet = new Set<string>();
  
  // Cache the brand counts in memory for better performance
  let brandCounts: Record<string, number> = {};
  
  // Always compute brand counts when filtering, regardless of whether brand filtering is active
  // This helps with the "Other" category and general brand filtering
  console.log('Computing brand counts for filtering...');
    
  laptops.forEach(laptop => {
    if (!laptop.brand && !laptop.title) return;
    
    // Use cached normalized brand if available
    const cacheKey = `${laptop.brand || ''}_${laptop.title || ''}`;
    let normalizedBrand: string;
    
    if (brandCache.has(cacheKey)) {
      normalizedBrand = brandCache.get(cacheKey)!;
    } else {
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
  
  console.log('Main brands set:', Array.from(mainBrandsSet));

  // Apply filters in order of speed (fastest first) to short-circuit early
  const filteredLaptops = laptops.filter(laptop => {
    // Early return if laptop has no title or key specs
    if (!laptop.title || (!laptop.processor && !laptop.ram && !laptop.storage && !laptop.graphics)) {
      return false;
    }
    
    // 1. Price filter (fastest to check)
    if (!applyPriceFilter(laptop, filters)) return false;
    
    // 2. Brand filter (next fastest)
    if (filters.brands.size > 0) {
      const brandMatch = applyBrandFilter(laptop, filters, mainBrandsSet);
      if (!brandMatch) return false;
    }
    
    // 3. RAM filter (relatively simple comparison)
    if (filters.ramSizes.size > 0 && !applyRamFilter(laptop, filters)) return false;
    
    // 4. Storage filter
    if (filters.storageOptions.size > 0 && !applyStorageFilter(laptop, filters)) return false;
    
    // 5. Screen size filter
    if (filters.screenSizes.size > 0 && !applyScreenSizeFilter(laptop, filters)) return false;
    
    // 6. Graphics filter (more complex)
    if (filters.graphicsCards.size > 0 && !applyGraphicsFilter(laptop, filters)) return false;
    
    // 7. Processor filter (most complex, do last)
    if (filters.processors.size > 0 && !applyProcessorFilter(laptop, filters)) return false;

    return true;
  });

  console.log(`Filtering complete: ${filteredLaptops.length} out of ${laptops.length} laptops matched filters`);
  
  // Sample filtered laptops to validate brand filtering is working
  if (filters.brands.size > 0 && filteredLaptops.length > 0) {
    const sampleSize = Math.min(5, filteredLaptops.length);
    console.log(`Sample of filtered laptops (${sampleSize}):`);
    for (let i = 0; i < sampleSize; i++) {
      const laptop = filteredLaptops[i];
      console.log(`[${i+1}] Brand: ${laptop.brand}, Title: ${laptop.title?.substring(0, 30)}...`);
    }
  } else if (filteredLaptops.length === 0) {
    console.log('No laptops matched the current filters');
  }
  
  return filteredLaptops;
};
