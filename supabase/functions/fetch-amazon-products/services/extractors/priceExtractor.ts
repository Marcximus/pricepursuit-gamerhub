
/**
 * Extract price from RapidAPI Amazon product data
 */
export function extractPrice(product: any): string | number {
  // Log the input data for debugging
  console.log(`💰 Price extraction for ASIN: ${product.asin || 'unknown'}`);
  
  // Check for product_price from the new RapidAPI format
  if (product.product_price) {
    const priceStr = product.product_price;
    console.log(`💰 Found product_price: ${priceStr}`);
    
    // Strip currency symbol and convert to number
    if (typeof priceStr === 'string') {
      const match = priceStr.match(/[0-9,.]+/);
      if (match) {
        const price = parseFloat(match[0].replace(/,/g, ''));
        console.log(`💰 Extracted price: ${price}`);
        return price;
      }
      return priceStr;
    }
    return product.product_price;
  }
  
  // Check for minimum offer price (sometimes cheaper than main price)
  if (product.product_minimum_offer_price) {
    const priceStr = product.product_minimum_offer_price;
    console.log(`💰 Found minimum offer price: ${priceStr}`);
    
    if (typeof priceStr === 'string') {
      const match = priceStr.match(/[0-9,.]+/);
      if (match) {
        const price = parseFloat(match[0].replace(/,/g, ''));
        console.log(`💰 Extracted minimum price: ${price}`);
        return price;
      }
      return priceStr;
    }
    return product.product_minimum_offer_price;
  }
  
  // Fallback to legacy price format
  if (product.price) {
    console.log(`💰 Falling back to legacy price format: ${product.price}`);
    if (typeof product.price === 'number') {
      return product.price;
    }
    
    if (typeof product.price === 'string') {
      const match = product.price.match(/[0-9,.]+/);
      if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
      }
      return product.price;
    }
    
    if (product.price.value !== undefined) {
      return product.price.value;
    }
  }
  
  console.log(`⚠️ Could not extract price for product: ${product.asin || 'unknown'}`);
  return 'Price not available';
}
