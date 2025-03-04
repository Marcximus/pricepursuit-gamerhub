
import { normalizeBrand } from "../../normalizers/brandNormalizer";

/**
 * Extract brand with priority logic (from multiple sources)
 */
export function extractBrand(content: any): string {
  // Try multiple sources in order of reliability
  const sources = [
    content.brand,
    content.product_details?.brand?.replace('‎', ''),
    // Extract from title
    content.title ? normalizeBrand('', content.title) : null
  ];
  
  // Return the first non-empty value
  for (const source of sources) {
    if (source && typeof source === 'string' && source.trim().length > 0) {
      return source.trim();
    }
  }
  
  return '';
}
