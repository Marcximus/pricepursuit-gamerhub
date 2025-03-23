
/**
 * Minimal processor for Amazon products that preserves all raw data
 */
export function processAmazonProducts(data: any) {
  if (!data.data?.products || !Array.isArray(data.data.products)) {
    console.warn("⚠️ No products found in RapidAPI response or invalid format");
    return [];
  }
  
  console.log(`✅ Received ${data.data?.products?.length || 0} products from RapidAPI`);
  
  // Simply pass through the complete raw products with minimal enhancements
  const products = data.data.products.map((product: any, index: number) => {
    // Extract basic product information with fallbacks
    const title = product.title || product.name || 'Lenovo Laptop';
    const brand = product.brand || 'Lenovo';
    const asin = product.asin || '';
    const imageUrl = product.image || product.images?.[0] || '';
    const url = product.url || product.link || `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
    const price = product.price?.value || product.price || '';
    const rating = product.rating || product.stars || '';
    const ratingsTotal = product.ratings_total || product.reviews_total || '';
    
    return {
      ...product,
      title,
      brand,
      asin,
      image: imageUrl,
      imageUrl,
      url,
      productUrl: url,
      price: price,
      rating: rating,
      ratings_total: ratingsTotal,
      rank: index + 1, // Keep rank property for display order
      _rawData: true // Flag to indicate this has raw data
    };
  });
  
  console.log(`🏁 Returning ${products.length} products with complete raw data`);
  console.log(`📤 FINAL RESPONSE PREVIEW: First product: "${products[0]?.title?.substring(0, 30)}..." Price: $${products[0]?.price?.value || products[0]?.price || 'N/A'}`);
  
  // Return all products, up to 15 max to ensure we have enough data
  return products.slice(0, 15);
}
