
import { normalizeModel } from "../../normalizers/modelNormalizer";
import { extractBrand } from "./brandExtractor";

/**
 * Extract model with best-effort approach
 */
export function extractModel(content: any): string {
  const brand = extractBrand(content);
  const title = content.title || '';
  
  // Try product_details.series first
  if (content.product_details?.series && 
      typeof content.product_details.series === 'string' &&
      content.product_details.series.trim().length > 0) {
    return content.product_details.series.replace('‎', '').trim();
  }
  
  // Fall back to model extractor
  return normalizeModel('', title, brand);
}
