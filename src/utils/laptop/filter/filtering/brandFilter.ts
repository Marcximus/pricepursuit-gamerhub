
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { matchesFilter } from "../matchers";
import { normalizeBrand } from "@/utils/laptop/normalizers/brandNormalizer";

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
  const normalizedBrandLower = normalizedBrand.toLowerCase();
  const hasOtherBrandsFilter = filters.brands.has('Other');
  
  // Standard brand filtering without "Other" category
  const matchesSpecificBrand = Array.from(filters.brands)
    .filter(brand => brand !== 'Other')
    .some(selectedBrand => 
      matchesFilter(selectedBrand, normalizedBrand, 'brand', laptop.title)
    );
  
  // Add more detailed logging for specific problematic brands
  if (normalizedBrandLower.includes('ist') || laptop.brand?.toLowerCase().includes('ist')) {
    console.log(`IST brand laptop matched filter: ${matchesSpecificBrand}`, {
      originalBrand: laptop.brand,
      normalizedBrand,
      title: laptop.title?.substring(0, 50),
      selectedBrands: Array.from(filters.brands)
    });
  }
  
  // If matches a specific selected brand, include it
  if (matchesSpecificBrand) {
    return true;
  }
  
  // Special handling for "Other" category
  if (hasOtherBrandsFilter) {
    // Check if the laptop brand is a major brand (in the mainBrandsSet)
    const isMainBrand = mainBrandsSet.has(normalizedBrandLower);
    
    // Only include in "Other" if it's not a main brand and not matching any specific selected brand
    return !isMainBrand && !matchesSpecificBrand;
  }
  
  // If no specific brand matches and "Other" is not selected, exclude
  return false;
};
