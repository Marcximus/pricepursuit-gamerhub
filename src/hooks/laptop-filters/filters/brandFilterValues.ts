
import type { Product } from "@/types/product";
import { normalizerMap, validatorMap } from "../helpers/filterHelpers";
import { sorterMap } from "../helpers/filterSorters";
import { getValidValues } from "../helpers/filterUtils";
import { normalizeBrand } from "@/utils/laptop/normalizers/brandNormalizer";

/**
 * Groups brands with fewer than the threshold occurrences into an "Other" category
 * and returns only unique brand values, making sure brands in "Other" don't appear individually
 */
export const getGroupedBrandValues = (
  laptops: Product[] | undefined,
  threshold: number = 15
): Set<string> => {
  if (!laptops || laptops.length === 0) {
    return new Set<string>();
  }

  // Get all brand values
  const normalizer = normalizerMap['brand'] || ((val: string) => val.trim());
  const validator = validatorMap['brand'];
  
  // Count occurrences of each brand
  const brandCounts: Record<string, number> = {};
  
  laptops.forEach(laptop => {
    if (!laptop.brand && !laptop.title) return;
    
    const normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title);
    if (!normalizedBrand || (validator && !validator(normalizedBrand))) return;
    
    brandCounts[normalizedBrand] = (brandCounts[normalizedBrand] || 0) + 1;
  });
  
  // Log all brands with their counts for debugging
  console.log('All brands with counts:', Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20));
  
  // Separate brands into main brands and "Other"
  const mainBrands: string[] = [];
  const otherBrands: string[] = [];
  
  Object.entries(brandCounts).forEach(([brand, count]) => {
    // Only include brands that actually have laptops in the results
    // and that have at least one matching laptop (count > 0)
    if (count > 0) {
      if (count >= threshold) {
        mainBrands.push(brand);
      } else {
        otherBrands.push(brand);
      }
    }
  });
  
  // Sort main brands alphabetically
  const sortedMainBrands = mainBrands.sort((a, b) => a.localeCompare(b));
  
  // Add "Other" category if there are any other brands
  if (otherBrands.length > 0) {
    const totalOtherLaptops = otherBrands.reduce((sum, brand) => sum + (brandCounts[brand] || 0), 0);
    console.log(`Grouped ${otherBrands.length} brands with fewer than ${threshold} laptops into "Other" category (${totalOtherLaptops} laptops total)`);
    
    // Log the brands being grouped into "Other" for debugging
    console.log("Brands in Other category:", otherBrands);
    
    // Always add "Other" at the end
    sortedMainBrands.push('Other');
  }
  
  console.log("Final brand filter options:", sortedMainBrands);
  return new Set(sortedMainBrands);
};
