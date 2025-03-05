
/**
 * Utility functions for generating URLs in recommendation cards
 */

/**
 * Generate a product URL based on the available product data or search query
 * @param product The product data, if available
 * @param searchQuery The search query to use if no product is available
 * @returns The appropriate URL for the recommendation
 */
export const getProductUrl = (
  productUrl?: string,
  searchQuery?: string
): string => {
  if (productUrl) {
    return productUrl;
  } else if (searchQuery) {
    return `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;
  }
  return '#';
};
