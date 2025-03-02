
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { matchesFilter } from "../matchers";
import { normalizeBrand } from "@/utils/laptop/valueNormalizer";

/**
 * Apply brand filtering to a laptop
 */
export const applyBrandFilter = (
  laptop: Product,
  filters: FilterOptions,
  mainBrandsSet: Set<string>
): boolean => {
  if (filters.brands.size === 0) {
    return true;
  }
  
  // If brand is not specified, exclude when brand filter is active
  if (!laptop.brand && !laptop.title) {
    return false;
  }
  
  const normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title);
  const hasOtherBrandsFilter = filters.brands.has('Other');
  
  // Debug logging to troubleshoot filtering
  console.log(`Filtering by brand: ${normalizedBrand}, selected brands:`, Array.from(filters.brands));
  
  // Special handling for "Other" category
  if (hasOtherBrandsFilter) {
    // Check if the laptop brand is a major brand (in the mainBrandsSet)
    const isMainBrand = mainBrandsSet.has(normalizedBrand.toLowerCase());
    
    // Check if it matches any specifically selected brand
    const matchesSelectedBrand = Array.from(filters.brands)
      .filter(brand => brand !== 'Other')
      .some(brand => 
        matchesFilter(brand, normalizedBrand, 'brand', laptop.title)
      );
    
    // If "Other" is selected and this is not a main brand and doesn't match any selected brand
    if (!isMainBrand && !matchesSelectedBrand) {
      return true;
    }
    
    // If a specific brand is selected and this laptop matches it
    if (matchesSelectedBrand) {
      return true;
    }
    
    return false;
  } else {
    // Standard brand filtering without "Other" category
    const matches = Array.from(filters.brands).some(selectedBrand => 
      matchesFilter(selectedBrand, normalizedBrand, 'brand', laptop.title)
    );
    console.log(`Brand match result for ${normalizedBrand}: ${matches}`);
    return matches;
  }
};
