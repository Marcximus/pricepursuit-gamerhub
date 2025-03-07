
import { formatSpecs, generateHtmlContent } from "../utils/formatters/index.ts";

export function processAmazonProducts(data: any) {
  if (!data.data?.products || !Array.isArray(data.data.products)) {
    console.warn("⚠️ No products found in RapidAPI response or invalid format");
    return [];
  }
  
  console.log(`✅ Received ${data.data?.products?.length || 0} products from RapidAPI`);
  
  const products = (data.data.products || []).map((product: any, index: number) => {
    // Check for undefined properties and provide defaults
    const title = product.title || 'Unknown Product';
    const categories = product.categories || [];
    const asin = product.asin || '';
    const imageUrl = product.image || '';
    const productUrl = product.url || '#';
    const price = parseFloat(product.price?.value || '0') || 0;
    const rating = parseFloat(product.rating || '0') || 0;
    const ratingCount = parseInt(product.ratings_total || '0', 10) || 0;
    
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
    if (!isLaptop && title.trim() !== '' && title !== 'Unknown Product') {
      console.log(`⚠️ Product might not be a laptop: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"`);
    }
    
    // Return more comprehensive data to allow DeepSeek more flexibility
    return {
      rank: index + 1,
      asin: asin,
      title: title,
      brand: product.brand || 'Lenovo',
      price: price,
      rating: rating,
      ratingCount: ratingCount,
      imageUrl: imageUrl,
      productUrl: productUrl,
      specs: formatSpecs(product),
      htmlContent: generateHtmlContent(product, index + 1),
      // Include additional raw product data for DeepSeek
      rawData: {
        features: product.feature_bullets || [],
        reviews: product.reviews?.slice(0, 3) || [], // Send a few reviews
        description: product.description || '',
        specifications: product.specifications || {},
        categories: product.categories || [],
        price_information: product.price || {},
        availability: product.availability || {},
        delivery: product.delivery || {},
        is_prime: product.is_prime || false,
        is_amazon_choice: product.is_amazon_choice || false,
        is_best_seller: product.is_best_seller || false,
        variants: product.variants?.length > 0 ? product.variants.slice(0, 2) : [], // Include limited variant info
      }
    };
  });
  
  // Less strict laptop filtering logic - keep empty titles but improve laptop detection
  const laptopProducts = products.filter((p: any) => {
    const productTitle = p.title.toLowerCase();
    
    // Skip products with completely empty titles (keep all titles that have at least something)
    if (!productTitle.trim()) {
      return false;
    }
    
    // More lenient laptop detection with additional keywords
    return productTitle.includes('laptop') || 
           productTitle.includes('notebook') ||
           productTitle.includes('chromebook') ||
           productTitle.includes('macbook') ||
           productTitle.includes('thinkpad') || 
           productTitle.includes('ideapad') || 
           productTitle.includes('yoga') ||
           productTitle.includes('envy') ||
           productTitle.includes('pavilion') ||
           productTitle.includes('spectre') ||
           productTitle.includes('xps') ||
           productTitle.includes('inspiron') ||
           productTitle.includes('surface') ||
           productTitle.includes('vivobook') ||
           productTitle.includes('zenbook');
  });
  
  // Lower threshold for filtered products to ensure we don't miss good results
  // Only use the strict filtered list if we have plenty (8+) of laptop products
  const finalProducts = laptopProducts.length >= 8 ? laptopProducts : products;
  
  // Take the top 10 products or all if less than 10
  const top10Products = finalProducts.slice(0, 10);
  
  console.log(`🏁 Returning ${top10Products.length} products`);
  
  // Avoid logging large objects in production
  if (top10Products.length > 0) {
    const firstProductTitle = top10Products[0].title || 'Untitled product';
    console.log(`📤 FINAL RESPONSE PREVIEW: First product: "${firstProductTitle.substring(0, 50)}..."`);
    console.log(`📊 Data richness: ${Object.keys(top10Products[0].rawData || {}).length} additional data fields included per product`);
  } else {
    console.log(`📤 FINAL RESPONSE: No products to return`);
  }

  return top10Products;
}
