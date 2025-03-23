
/**
 * Extract price from various possible formats in the API response
 */
export function extractPrice(product: any): string | number {
  // Log the price-related fields for debugging
  console.log(`💰 Price data for "${product.title?.substring(0, 20) || 'Unknown'}":`, {
    directPrice: product.price,
    priceType: typeof product.price,
    priceValue: product?.price?.value,
    currentPrice: product?.price?.current_price,
    rawValue: product?.price?.raw
  });

  // Handle different price formats from RapidAPI
  
  // Case 1: price is an object with a value property
  if (product.price?.value !== undefined) {
    return product.price.value;
  }
  
  // Case 2: price is an object with current_price property
  if (product.price?.current_price !== undefined) {
    return product.price.current_price;
  }
  
  // Case 3: price is a direct number
  if (typeof product.price === 'number') {
    return product.price;
  }
  
  // Case 4: price is a string with currency symbol
  if (typeof product.price === 'string' && product.price) {
    // Extract numeric value if it's a string like "$599.99"
    const match = product.price.match(/[\d,.]+/);
    if (match) {
      // Remove commas and convert to float
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return product.price;
  }
  
  // Case 5: price is in raw format
  if (product.price?.raw) {
    const match = product.price.raw.match(/[\d,.]+/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
  }
  
  // Case 6: deals_price or original_price is available
  if (product.deals_price) {
    return typeof product.deals_price === 'number' ? 
      product.deals_price : 
      parseFloat(product.deals_price.replace(/[^0-9.]/g, ''));
  }

  if (product.original_price) {
    return typeof product.original_price === 'number' ? 
      product.original_price : 
      parseFloat(product.original_price.replace(/[^0-9.]/g, ''));
  }
  
  // Case 7: look for any field containing 'price'
  for (const key in product) {
    if (key.toLowerCase().includes('price') && 
        typeof product[key] === 'number' && 
        product[key] > 0) {
      return product[key];
    }
  }
  
  return 'Price not available';
}
