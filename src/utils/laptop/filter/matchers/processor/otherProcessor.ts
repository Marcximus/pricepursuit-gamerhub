
/**
 * "Other Processor" category matcher
 * Only matches processors that don't belong to any main category
 */
export const matchesOtherProcessor = (
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  // Import here to avoid circular dependencies
  const { isMainCategoryProcessor } = require('./processorMatcherCore');
  
  // Only categorize as "Other Processor" if it doesn't match any main category
  return !isMainCategoryProcessor(productValue, productTitle);
};
