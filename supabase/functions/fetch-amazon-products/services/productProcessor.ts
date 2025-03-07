
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
    
    // Only log warning for non-empty titles that don't appear to be laptops
    const isLaptop = 
      title.toLowerCase().includes('laptop') || 
      title.toLowerCase().includes('notebook') || 
      (categories.length > 0 && categories.some((cat: string) => 
        cat && typeof cat === 'string' && (
          cat.toLowerCase().includes('laptop') || 
          cat.toLowerCase().includes('notebook')
        )
      ));
    
    // Only log warnings for products with actual titles that don't match laptop keywords
    if (!isLaptop && title.trim() !== '') {
      console.log(`⚠️ Product might not be a laptop: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"`);
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
  
  // Improve laptop filtering logic
  const laptopProducts = products.filter((p: any) => {
    const productTitle = p.title.toLowerCase();
    
    // Skip empty titles in filtering
    if (!productTitle.trim()) {
      return false; // Filter out products with empty titles
    }
    
    // Check for laptop indicators in title
    return productTitle.includes('laptop') || 
           productTitle.includes('notebook') ||
           productTitle.includes('chromebook') ||
           // Additional keywords that might indicate laptops
           (p.brand.toLowerCase() === 'lenovo' && 
            (productTitle.includes('thinkpad') || 
             productTitle.includes('ideapad') || 
             productTitle.includes('yoga')));
  });
  
  // Take the best option between filtered and all products
  const finalProducts = laptopProducts.length >= 5 ? laptopProducts : products;
  
  // Take the top 10 products or all if less than 10
  const top10Products = finalProducts.slice(0, 10);
  
  console.log(`🏁 Returning ${top10Products.length} products`);
  
  // Avoid logging large objects in production
  if (top10Products.length > 0) {
    const firstProductTitle = top10Products[0].title || 'Untitled product';
    console.log(`📤 FINAL RESPONSE PREVIEW: First product: "${firstProductTitle.substring(0, 50)}..."`);
  } else {
    console.log(`📤 FINAL RESPONSE: No products to return`);
  }

  return top10Products;
}
