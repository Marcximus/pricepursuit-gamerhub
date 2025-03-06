
/**
 * Utility functions for formatting prices in recommendation cards
 */

/**
 * Format price for display, handling various input formats
 * @param price The price to format (string, number, null, or undefined)
 * @param fallbackMin Minimum price for fallback range
 * @param fallbackMax Maximum price for fallback range
 * @returns Formatted price string
 */
export const formatPrice = (
  price: string | number | null | undefined,
  fallbackMin: number,
  fallbackMax: number
): string => {
  if (price === null || price === undefined || price === 0 || price === '0') {
    return `$${fallbackMin.toLocaleString()} - $${fallbackMax.toLocaleString()}`;
  }
  
  if (typeof price === 'number') {
    return `$${Math.round(price).toLocaleString()}`;
  }
  
  if (typeof price === 'string') {
    // Extract numeric value and format
    const numericValue = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericValue)) {
      return `$${Math.round(numericValue).toLocaleString()}`;
    }
    if (price.startsWith('$')) return price;
    return `$${price}`;
  }
  
  return `$${fallbackMin.toLocaleString()} - $${fallbackMax.toLocaleString()}`;
};

/**
 * Calculate discount percentage between current and original price
 * @param currentPrice Current price (string or number)
 * @param originalPrice Original price (string or number)
 * @returns Discount percentage as a rounded integer
 */
export const calculateDiscount = (currentPrice: string | number, originalPrice: string | number): number => {
  const current = typeof currentPrice === 'string' ? parseFloat(currentPrice.replace(/[^0-9.]/g, '')) : currentPrice;
  const original = typeof originalPrice === 'string' ? parseFloat(originalPrice.replace(/[^0-9.]/g, '')) : originalPrice;
  
  if (isNaN(current) || isNaN(original) || original <= 0) {
    return 0;
  }
  
  const discount = ((original - current) / original) * 100;
  return Math.round(discount);
};
