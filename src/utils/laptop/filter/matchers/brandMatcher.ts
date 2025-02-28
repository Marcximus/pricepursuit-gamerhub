
import { normalizeBrand } from "@/utils/laptop/valueNormalizer";

/**
 * Matcher for brand filter values
 */
export const matchesBrandFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Use the specialized brand normalization function
  const normalizedProductBrand = normalizeBrand(productValue, productTitle);
  return normalizedProductBrand.toLowerCase() === filterValue.toLowerCase();
};
