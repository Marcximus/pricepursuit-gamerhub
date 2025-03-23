
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
  // First check if content already contains placeholders
  let hasPlaceholders = false;
  
  for (let i = 1; i <= 10; i++) {
    if (parsedContent.content.includes(`[PRODUCT_DATA_${i}]`)) {
      hasPlaceholders = true;
      break;
    }
  }
  
  if (!hasPlaceholders) {
    console.log(`⚠️ No product data placeholders found in content, adding them`);
    
    // Simple placeholder insertion if none exist
    let contentWithPlaceholders = parsedContent.content;
    
    // Find h3 headings that might represent product items
    const headings = contentWithPlaceholders.match(/<h3[^>]*>.*?<\/h3>/gi) || [];
    
    // If we found enough headings, insert placeholders after them
    if (headings.length >= 5) {
      for (let i = 0; i < Math.min(headings.length, 10); i++) {
        const productNum = i + 1;
        const placeholderTag = `<div class="product-data" data-product-id="${productNum}">[PRODUCT_DATA_${productNum}]</div>`;
        
        // Find the position of this heading
        const headingIndex = contentWithPlaceholders.indexOf(headings[i]);
        if (headingIndex !== -1) {
          const endOfHeading = headingIndex + headings[i].length;
          
          // Insert after the heading
          contentWithPlaceholders = 
            contentWithPlaceholders.substring(0, endOfHeading) + 
            '\n\n' + placeholderTag + '\n\n' + 
            contentWithPlaceholders.substring(endOfHeading);
        }
      }
      
      parsedContent.content = contentWithPlaceholders;
      console.log(`✅ Added product data placeholders after headings`);
    } else {
      // If not enough headings, add placeholders at the end
      let appendContent = '\n\n';
      for (let i = 1; i <= 10; i++) {
        appendContent += `<div class="product-data" data-product-id="${i}">[PRODUCT_DATA_${i}]</div>\n\n`;
      }
      
      parsedContent.content += appendContent;
      console.log(`✅ Added product data placeholders at the end of content`);
    }
  } else {
    console.log(`✅ Content already contains product data placeholders`);
  }
  
  return parsedContent;
}
