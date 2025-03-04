
/**
 * Matcher for "Other Graphics" category
 */
import { isOtherGraphics, mainGraphicsCategories } from '../core';
import { getGraphicsFilterValue } from '@/utils/laptop/normalizers/graphics';

export const matchesOtherGraphics = (
  normalizedProduct: string
): boolean => {
  if (!normalizedProduct) return false;
  
  // Get the filter value for the product
  const productFilterValue = getGraphicsFilterValue(normalizedProduct);
  
  // Determine if it belongs to "Other Graphics" category
  return isOtherGraphics(productFilterValue, mainGraphicsCategories);
};
