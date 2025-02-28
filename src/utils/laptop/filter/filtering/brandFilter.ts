
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
  
  // Special handling for "Other" category
  if (hasOtherBrandsFilter) {
    // Check if the laptop brand is a major brand (has its own filter)
    const isMainBrand = Array.from(mainBrandsSet).some(mainBrand => 
      normalizedBrand.toLowerCase().includes(mainBrand) ||
      mainBrand.includes(normalizedBrand.toLowerCase())
    );
    
    // Check if it matches a specifically selected brand
    const matchesSpecificBrand = Array.from(filters.brands)
      .filter(selectedBrand => selectedBrand !== 'Other')
      .some(selectedBrand => 
        matchesFilter(selectedBrand, normalizedBrand, 'brand', laptop.title)
      );
    
    // For "Other" category, include if it's not a main brand
    if (hasOtherBrandsFilter && !isMainBrand && !matchesSpecificBrand) {
      return true;
    }
    
    // For specific brands, only include if it matches one of them
    if (matchesSpecificBrand) {
      return true;
    }
    
    return false;
  } else {
    // Standard brand filtering without "Other" category
    const matchesBrand = Array.from(filters.brands).some(selectedBrand => 
      matchesFilter(selectedBrand, normalizedBrand, 'brand', laptop.title)
    );
    
    return matchesBrand;
  }
};
