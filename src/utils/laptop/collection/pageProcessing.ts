
import { containsForbiddenKeywords } from "../productFilters";

/**
 * Check if a product should be collected based on filtering rules
 * @param title Product title
 * @returns True if the product should be collected, false if it should be skipped
 */
export function shouldCollectProduct(title: string): boolean {
  // Skip products with forbidden keywords in the title
  return !containsForbiddenKeywords(title);
}
