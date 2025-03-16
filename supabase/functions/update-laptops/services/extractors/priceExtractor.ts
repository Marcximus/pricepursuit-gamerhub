
/**
 * Extract price from API response with robust fallbacks
 */
export function extractPrice(content: any): number | null {
  // Try different price fields in order of preference
  const priceFields = ['price', 'price_buybox', 'price_sns', 'price_initial'];
  
  for (const field of priceFields) {
    const price = content[field];
    if (typeof price === 'number' && price > 0) {
      return price;
    }
  }
  
  // Try to extract from price string if numeric fields aren't available
  if (content.pricing_str) {
    const priceMatch = content.pricing_str.match(/\$(\d+\.\d+)/);
    if (priceMatch && priceMatch[1]) {
      const price = parseFloat(priceMatch[1]);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }
  
  // Try to extract from any text field that might contain price
  if (content.title) {
    const priceMatch = content.title.match(/\$(\d+\.?\d*)/);
    if (priceMatch && priceMatch[1]) {
      const price = parseFloat(priceMatch[1]);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }
  
  // If stock says unavailable, price is truly null
  if (content.stock && content.stock.includes('unavailable')) {
    return null;
  }
  
  return null;
}
