
import { normalizeBrand } from "../../../normalizers/brandNormalizer";

/**
 * Extract brand with priority logic (from multiple sources)
 */
export function extractBrand(content: any): string {
  // Extract from title first for higher reliability
  if (content.title) {
    const titleExtractedBrand = normalizeBrand('', content.title);
    if (titleExtractedBrand && titleExtractedBrand !== 'Unknown Brand') {
      return titleExtractedBrand;
    }
  }
  
  // Fall back to other sources if title-based detection failed
  const sources = [
    content.brand,
    content.product_details?.brand?.replace('‎', ''),
  ];
  
  // Return the first non-empty value
  for (const source of sources) {
    if (source && typeof source === 'string' && source.trim().length > 0) {
      // Double-check with normalizeBrand to handle cases like "FSJUN" for Apple products
      const normalizedBrand = normalizeBrand(source.trim(), content.title);
      if (normalizedBrand !== 'Unknown Brand') {
        return normalizedBrand;
      }
      return source.trim();
    }
  }
  
  return '';
}
