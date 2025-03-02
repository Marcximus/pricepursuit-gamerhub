
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

// Cache for brand normalization
const brandNormalizationCache = new Map<string, string>();

// Cache for processor extraction
const processorExtractionCache = new Map<string, string>();

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

  // Skip filtering if no filters are applied (fast path)
  if (!hasActiveFilters(filters)) {
    console.log('No active filters, returning all laptops');
    return laptops;
  }

  // Create a set of major brands (brands with 15+ items)
  const mainBrandsSet = new Set<string>();
  
  // Count occurrences of each brand - do this once upfront
  const brandCounts: Record<string, number> = {};
  
  laptops.forEach(laptop => {
    if (!laptop.brand && !laptop.title) return;
    
    // Use cached brand normalization if available
    const cacheKey = `${laptop.brand || ''}|${laptop.title || ''}`;
    let normalizedBrand: string;
    
    if (brandNormalizationCache.has(cacheKey)) {
      normalizedBrand = brandNormalizationCache.get(cacheKey)!;
    } else {
      normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title).toLowerCase();
      brandNormalizationCache.set(cacheKey, normalizedBrand);
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

  // Filter laptops in order of filter complexity (fastest first)
  const filteredLaptops = laptops.filter(laptop => {
    // Early return if laptop has no title or key specs
    if (!laptop.title || (!laptop.processor && !laptop.ram && !laptop.storage && !laptop.graphics)) {
      return false;
    }
    
    // Apply filters in order of computational complexity (fastest first)
    
    // 1. Price filter (simple numeric comparison, very fast)
    if (!applyPriceFilter(laptop, filters)) return false;
    
    // 2. Brand filter (string comparison with caching)
    if (!applyBrandFilter(laptop, filters, mainBrandsSet)) return false;
    
    // 3. RAM filter (regex but simpler patterns)
    if (!applyRamFilter(laptop, filters)) return false;
    
    // 4. Storage filter 
    if (!applyStorageFilter(laptop, filters)) return false;
    
    // 5. Screen size filter
    if (!applyScreenSizeFilter(laptop, filters)) return false;
    
    // 6. Graphics filter (more complex regex patterns)
    if (!applyGraphicsFilter(laptop, filters)) return false;
    
    // 7. Processor filter (most complex with many patterns and fallbacks)
    // Use cached processor extraction if available
    if (laptop.id) {
      let extractedProcessor: string | undefined;
      
      if (processorExtractionCache.has(laptop.id)) {
        extractedProcessor = processorExtractionCache.get(laptop.id);
      } else {
        extractedProcessor = extractProcessorFromTitle(laptop.title, laptop.processor);
        if (laptop.id && extractedProcessor) {
          processorExtractionCache.set(laptop.id, extractedProcessor);
        }
      }
    }
    
    if (!applyProcessorFilter(laptop, filters)) return false;

    return true;
  });

  console.log(`Filtering complete: ${filteredLaptops.length} out of ${laptops.length} laptops matched filters`);
  
  return filteredLaptops;
};
