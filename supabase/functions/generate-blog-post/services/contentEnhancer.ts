
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
    console.log(`🔍 Found ${headings.length} potential h3 headings to add placeholders after`);
    
    // If we found enough headings, insert placeholders after them
    if (headings.length >= 3) {
      for (let i = 0; i < Math.min(headings.length, 10); i++) {
        const productNum = i + 1;
        // Create a placeholder tag
        const placeholderTag = `[PRODUCT_DATA_${productNum}]`;
        
        // Find the position of this heading
        const headingIndex = contentWithPlaceholders.indexOf(headings[i]);
        if (headingIndex !== -1) {
          const endOfHeading = headingIndex + headings[i].length;
          
          // Ensure the placeholder doesn't already exist right after the heading
          const nextChars = contentWithPlaceholders.substring(endOfHeading, endOfHeading + 50);
          if (!nextChars.includes(placeholderTag)) {
            // Insert after the heading
            contentWithPlaceholders = 
              contentWithPlaceholders.substring(0, endOfHeading) + 
              '\n' + placeholderTag + '\n' + 
              contentWithPlaceholders.substring(endOfHeading);
          }
        }
      }
      
      parsedContent.content = contentWithPlaceholders;
      console.log(`✅ Added product data placeholders after h3 headings`);
    } else {
      // If not enough headings, try to find numbered items or bullet points in content
      const numberedItems = contentWithPlaceholders.match(/(\d+)\.\s+([^\n]+)/g) || [];
      const bulletPoints = contentWithPlaceholders.match(/<li>(.+?)<\/li>/g) || [];
      
      console.log(`🔍 Found ${numberedItems.length} numbered items and ${bulletPoints.length} bullet points`);
      
      if (numberedItems.length >= 3) {
        for (let i = 0; i < Math.min(numberedItems.length, 10); i++) {
          const productNum = i + 1;
          const placeholderTag = `[PRODUCT_DATA_${productNum}]`;
          
          // Find position of this numbered item
          const itemIndex = contentWithPlaceholders.indexOf(numberedItems[i]);
          if (itemIndex !== -1) {
            const endOfItem = itemIndex + numberedItems[i].length;
            
            // Insert after the numbered item
            contentWithPlaceholders = 
              contentWithPlaceholders.substring(0, endOfItem) + 
              '\n\n' + placeholderTag + '\n\n' + 
              contentWithPlaceholders.substring(endOfItem);
          }
        }
        
        parsedContent.content = contentWithPlaceholders;
        console.log(`✅ Added product data placeholders after numbered items`);
      } else {
        // Last resort: Force-inject placeholders at strategic points in the content
        console.log(`⚠️ No clear structure found for placeholder insertion, using emergency insertion`);
        
        // Split content and determine insertion points
        const contentParts = contentWithPlaceholders.split(/<hr[^>]*>/i);
        
        if (contentParts.length >= 4) {
          // We have at least some <hr> tags, insert after intro but before conclusion
          let newContent = contentParts[0]; // Intro
          
          // Process middle parts (product sections)
          const middleParts = contentParts.slice(1, -1);
          const sections = Math.min(middleParts.length, 10);
          
          for (let i = 0; i < sections; i++) {
            const productNum = i + 1;
            // Find heading in this section
            const sectionContent = middleParts[i];
            const headingMatch = sectionContent.match(/<h[2-4][^>]*>.*?<\/h[2-4]>/i);
            
            if (headingMatch) {
              // Insert after heading
              const headingIndex = sectionContent.indexOf(headingMatch[0]) + headingMatch[0].length;
              newContent += '<hr class="my-8">' + 
                           sectionContent.substring(0, headingIndex) + 
                           `\n[PRODUCT_DATA_${productNum}]\n` + 
                           sectionContent.substring(headingIndex);
            } else {
              // Just insert at the beginning of the section
              newContent += '<hr class="my-8">' + 
                           `\n[PRODUCT_DATA_${productNum}]\n` + 
                           sectionContent;
            }
          }
          
          // Add conclusion
          newContent += '<hr class="my-8">' + contentParts[contentParts.length - 1];
          
          parsedContent.content = newContent;
          console.log(`✅ Added product data placeholders using emergency hr-based insertion`);
        } else {
          // If no structure found at all, add placeholders at the end
          console.log(`⚠️ No structure found for placeholders, appending to the end`);
          let appendContent = '\n\n<hr class="my-8">\n<h2>Product Recommendations</h2>\n\n';
          for (let i = 1; i <= 10; i++) {
            appendContent += `<h3>Product ${i}</h3>\n[PRODUCT_DATA_${i}]\n\n`;
          }
          
          parsedContent.content += appendContent;
          console.log(`✅ Added product data placeholders at the end of content`);
        }
      }
    }
    
    // Verify placeholders were added
    let placeholderCount = 0;
    for (let i = 1; i <= 10; i++) {
      if (parsedContent.content.includes(`[PRODUCT_DATA_${i}]`)) {
        placeholderCount++;
      }
    }
    console.log(`✅ Added ${placeholderCount} product data placeholders in total`);
  } else {
    console.log(`✅ Content already contains product data placeholders`);
    
    // Count how many placeholders exist
    let placeholderCount = 0;
    for (let i = 1; i <= 10; i++) {
      if (parsedContent.content.includes(`[PRODUCT_DATA_${i}]`)) {
        placeholderCount++;
      }
    }
    console.log(`🔍 Content contains ${placeholderCount} product data placeholders`);
  }
  
  return parsedContent;
}
