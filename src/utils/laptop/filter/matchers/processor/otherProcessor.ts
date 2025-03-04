
import { isMainCategoryProcessor } from './core/isMainCategoryProcessor';

/**
 * Matcher for "Other Processor" category
 * This includes processors that don't fit into any main category
 */
export const matchesOtherProcessor = (
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue && !productTitle) return false;
  
  // If the product's processor belongs to a main category, it's not "Other"
  if (isMainCategoryProcessor(productValue, productTitle)) {
    return false;
  }
  
  // If it doesn't match any main category, it's "Other"
  return true;
};
