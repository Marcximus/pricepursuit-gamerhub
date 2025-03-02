
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
  // If no brand filters selected, return all laptops
  if (filters.brands.size === 0) {
    return true;
  }
  
  // If brand is not specified in the laptop data, exclude when brand filter is active
  // unless we can extract it from the title
  if (!laptop.brand && !laptop.title) {
    return false;
  }
  
  // Log all selected brands for debugging
  console.log(`Selected brands (${filters.brands.size}):`, Array.from(filters.brands));
  
  // Get the normalized brand for this laptop
  const normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title);
  console.log(`Normalized brand for "${laptop.brand || laptop.title?.substring(0, 30)}": "${normalizedBrand}"`);
  
  // Check if "Other" is among the selected brands
  const hasOtherBrandsFilter = filters.brands.has('Other');
  
  // Special handling for "Other" category
  if (hasOtherBrandsFilter) {
    // Check if the laptop brand is a major brand (in the mainBrandsSet)
    const isMainBrand = mainBrandsSet.has(normalizedBrand.toLowerCase());
    console.log(`Is ${normalizedBrand} a main brand? ${isMainBrand}`);
    
    // Check if it matches any specifically selected brand
    const matchesSelectedBrand = Array.from(filters.brands)
      .filter(brand => brand !== 'Other')
      .some(brand => {
        const match = matchesFilter(brand, normalizedBrand, 'brand', laptop.title);
        console.log(`  - Comparing with ${brand}: ${match}`);
        return match;
      });
    
    // If "Other" is selected and this is not a main brand and doesn't match any other selected brand
    if (!isMainBrand && !matchesSelectedBrand) {
      console.log(`${normalizedBrand} matches "Other" category`);
      return true;
    }
    
    // If a specific brand is selected and this laptop matches it
    if (matchesSelectedBrand) {
      console.log(`${normalizedBrand} matches a specifically selected brand`);
      return true;
    }
    
    console.log(`${normalizedBrand} does not match any selected brands including "Other"`);
    return false;
  } else {
    // Standard brand filtering without "Other" category
    const matches = Array.from(filters.brands).some(selectedBrand => {
      const doesMatch = matchesFilter(selectedBrand, normalizedBrand, 'brand', laptop.title);
      console.log(`Comparing "${selectedBrand}" with "${normalizedBrand}": ${doesMatch}`);
      return doesMatch;
    });
    
    console.log(`Final brand match result for ${normalizedBrand}: ${matches}`);
    return matches;
  }
};
