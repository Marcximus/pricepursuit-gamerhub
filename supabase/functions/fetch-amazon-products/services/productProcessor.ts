
/**
 * Minimal processor for Amazon products that preserves all raw data
 */
export function processAmazonProducts(data: any) {
  if (!data.data?.products || !Array.isArray(data.data.products)) {
    console.warn("⚠️ No products found in RapidAPI response or invalid format");
    return [];
  }
  
  console.log(`✅ Received ${data.data?.products?.length || 0} products from RapidAPI`);
  
  // Simply pass through the products with minimal formatting and ranking
  const products = (data.data.products || []).map((product: any, index: number) => {
    return {
      rank: index + 1,
      ...product,
      // Include any calculated fields the frontend might expect
      price: parseFloat(product.price?.value || '0') || 0,
      imageUrl: product.image || '',
      productUrl: product.url || '#'
    };
  });
  
  // Take the top 10 products or all if less than 10
  const top10Products = products.slice(0, 10);
  
  console.log(`🏁 Returning ${top10Products.length} products with complete raw data`);
  
  return top10Products;
}
