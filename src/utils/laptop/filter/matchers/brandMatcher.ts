
import { normalizeBrand } from "@/utils/laptop/normalizers/brandNormalizer";

/**
 * Matcher for brand filter values with improved accuracy
 */
export const matchesBrandFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Use the specialized brand normalization function
  const normalizedProductBrand = normalizeBrand(productValue, productTitle);
  
  // Case insensitive comparison
  return normalizedProductBrand.toLowerCase() === filterValue.toLowerCase();
};
