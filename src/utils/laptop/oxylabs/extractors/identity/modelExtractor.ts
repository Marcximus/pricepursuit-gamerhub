
import { normalizeModel } from "../../../normalizers/modelNormalizer";
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
      content.product_details.series.trim().length > 0 &&
      content.product_details.series.trim() !== brand) {
    return content.product_details.series.replace('‎', '').trim();
  }
  
  // Try to extract model from the product details
  if (content.product_details?.model_name && 
      typeof content.product_details.model_name === 'string' &&
      content.product_details.model_name.trim().length > 0 &&
      content.product_details.model_name.trim() !== brand) {
    return content.product_details.model_name.replace('‎', '').trim();
  }
  
  // Try to extract model from the product details item number
  if (content.product_details?.item_model_number && 
      typeof content.product_details.item_model_number === 'string' &&
      content.product_details.item_model_number.trim().length > 0) {
    return content.product_details.item_model_number.replace('‎', '').trim();
  }
  
  // Fall back to model extractor from title
  return normalizeModel('', title, brand);
}
