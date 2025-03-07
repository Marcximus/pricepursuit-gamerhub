
/**
 * Services for enhancing the generated content with product data
 */
import { logError } from "../utils/errorHandler.ts";

export function enhanceReviewContent(parsedContent: any, productData: any, asin: string): any {
  console.log(`🔄 Augmenting review content with product data`);
  try {
    parsedContent.productData = {
      asin,
      title: productData.title,
      brand: productData.brand,
      price: productData.price?.current,
      rating: productData.rating?.rating,
      reviewCount: productData.rating?.rating_count,
      imageUrl: productData.images?.[0],
      productUrl: productData.url
    };
    console.log(`✅ Added product data to review content`);
    return parsedContent;
  } catch (error) {
    logError(error, 'Error enhancing review content');
    return parsedContent;
  }
}

export function enhanceComparisonContent(parsedContent: any, product1: any, product2: any, asin1: string, asin2: string): any {
  console.log(`🔄 Augmenting comparison content with product data for both products`);
  try {
    parsedContent.comparisonData = {
      product1: {
        asin: asin1,
        title: product1.title,
        brand: product1.brand,
        price: product1.price?.current,
        rating: product1.rating?.rating,
        reviewCount: product1.rating?.rating_count,
        imageUrl: product1.images?.[0],
        productUrl: product1.url
      },
      product2: {
        asin: asin2,
        title: product2.title,
        brand: product2.brand,
        price: product2.price?.current,
        rating: product2.rating?.rating,
        reviewCount: product2.rating?.rating_count,
        imageUrl: product2.images?.[0],
        productUrl: product2.url
      }
    };
    console.log(`✅ Added comparison data for both products`);
    return parsedContent;
  } catch (error) {
    logError(error, 'Error enhancing comparison content');
    return parsedContent;
  }
}

export function enhanceTop10Content(parsedContent: any): any {
  console.log(`🔄 Ensuring product data placeholders in Top10 content`);
  if (!parsedContent.content.includes('[PRODUCT_DATA_')) {
    console.log(`⚠️ No product data placeholders found in content, adding them`);
    
    // Simple placeholder insertion if none exist
    let contentWithPlaceholders = parsedContent.content;
    for (let i = 1; i <= 10; i++) {
      const placeholderTag = `<div class="product-data" data-product-id="${i}">[PRODUCT_DATA_${i}]</div>`;
      
      // Find a suitable location to insert placeholders - after each h3 heading
      const headingPattern = new RegExp(`<h3[^>]*>.*?${i}\\s*\\..*?</h3>`, 'i');
      const headingMatch = contentWithPlaceholders.match(headingPattern);
      
      if (headingMatch && headingMatch.index) {
        const insertPosition = headingMatch.index + headingMatch[0].length;
        contentWithPlaceholders = 
          contentWithPlaceholders.substring(0, insertPosition) + 
          '\n\n' + placeholderTag + '\n\n' + 
          contentWithPlaceholders.substring(insertPosition);
      }
    }
    
    parsedContent.content = contentWithPlaceholders;
    console.log(`✅ Added product data placeholders to content`);
  } else {
    console.log(`✅ Content already contains product data placeholders`);
  }
  
  return parsedContent;
}
