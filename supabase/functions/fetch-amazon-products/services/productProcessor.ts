
import { formatSpecs, generateHtmlContent } from "../utils/formatters/index.ts";

export function processAmazonProducts(data: any) {
  if (!data.data?.products || !Array.isArray(data.data.products)) {
    console.warn("⚠️ No products found in RapidAPI response or invalid format");
    return [];
  }
  
  console.log(`✅ Received ${data.data?.products?.length || 0} products from RapidAPI`);
  
  const products = (data.data.products || []).map((product: any, index: number) => {
    // Check for undefined properties and provide defaults
    const title = product.title || '';
    const categories = product.categories || [];
    
    // Determine if this product is a laptop
    const isLaptop = 
      title.toLowerCase().includes('laptop') || 
      title.toLowerCase().includes('notebook') || 
      (categories.length > 0 && categories.some((cat: string) => 
        cat && typeof cat === 'string' && (
          cat.toLowerCase().includes('laptop') || 
          cat.toLowerCase().includes('notebook')
        )
      ));
    
    if (!isLaptop) {
      console.log(`⚠️ Product might not be a laptop: "${title}"`);
    }
    
    return {
      rank: index + 1,
      asin: product.asin || '',
      title: title,
      brand: product.brand || 'Unknown',
      price: parseFloat(product.price?.value || '0'),
      rating: parseFloat(product.rating || '0'),
      ratingCount: parseInt(product.ratings_total || '0', 10),
      imageUrl: product.image || '',
      productUrl: product.url || '',
      specs: formatSpecs(product),
      htmlContent: generateHtmlContent(product, index + 1)
    };
  });
  
  // Filter out non-laptop products if we have enough products
  const laptopProducts = products.filter((p: any) => 
    p.title.toLowerCase().includes('laptop') || 
    p.title.toLowerCase().includes('notebook'));
  
  const finalProducts = laptopProducts.length >= 5 ? laptopProducts : products;
  
  // Take the top 10 products or all if less than 10
  const top10Products = finalProducts.slice(0, 10);
  
  console.log(`🏁 Returning ${top10Products.length} products`);
  
  // Avoid logging large objects in production
  if (top10Products.length > 0) {
    console.log(`📤 FINAL RESPONSE PREVIEW: First product: "${top10Products[0].title.substring(0, 50)}..."`);
  } else {
    console.log(`📤 FINAL RESPONSE: No products to return`);
  }

  return top10Products;
}
