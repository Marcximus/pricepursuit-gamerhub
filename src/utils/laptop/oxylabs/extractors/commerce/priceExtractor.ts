
/**
 * Extract current price with fallbacks
 */
export function extractPrice(content: any): number | null {
  // Try multiple price fields in order of preference
  const priceValues = [
    content.price,
    content.price_buybox,
    content.price_initial,
    content.price_upper
  ];
  
  for (const price of priceValues) {
    if (price && typeof price === 'number' && price > 0) {
      return price;
    }
  }
  
  // If there's text about item being unavailable, price is null
  if (content.stock && content.stock.includes('unavailable')) {
    return null;
  }
  
  return null;
}

/**
 * Extract original price (if available)
 */
export function extractOriginalPrice(content: any): number | null {
  // Original price is usually the higher price if multiple prices exist
  if (content.price_initial && content.price && content.price_initial > content.price) {
    return content.price_initial;
  }
  
  return null;
}
