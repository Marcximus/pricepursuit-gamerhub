
import { normalizeBrand } from "@/utils/laptop/normalizers/brandNormalizer";

/**
 * Matcher for brand filter values with improved accuracy
 */
export const matchesBrandFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue && !productTitle) return false;
  
  // Use the specialized brand normalization function
  const normalizedProductBrand = normalizeBrand(productValue || '', productTitle);
  
  // Case insensitive comparison
  const matches = normalizedProductBrand.toLowerCase() === filterValue.toLowerCase();
  
  // Add debugging for brand matching
  console.log(`Brand matching: ${filterValue} vs ${normalizedProductBrand} = ${matches}`);
  
  return matches;
};
