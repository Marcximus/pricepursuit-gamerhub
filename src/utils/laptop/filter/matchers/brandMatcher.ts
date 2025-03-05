
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
  
  // Log problematic brand matches for debugging
  if (normalizedProductBrand.toLowerCase().includes('ist') || 
      (productValue && productValue.toLowerCase().includes('ist'))) {
    console.log(`Brand matching check for IST: '${filterValue}' vs '${normalizedProductBrand}'`, {
      matches: normalizedProductBrand.toLowerCase() === filterValue.toLowerCase(),
      originalValue: productValue
    });
  }
  
  // Case insensitive comparison
  return normalizedProductBrand.toLowerCase() === filterValue.toLowerCase();
};
