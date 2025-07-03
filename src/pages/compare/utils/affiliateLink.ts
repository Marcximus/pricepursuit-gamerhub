
/**
 * Create an affiliate URL for Amazon products
 */
export const getAffiliateUrl = (asin?: string): string => {
  if (!asin) return '#';
  return `https://www.amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
};
