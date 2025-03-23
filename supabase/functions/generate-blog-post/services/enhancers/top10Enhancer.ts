
/**
 * Service for enhancing Top10 content with product placeholders
 */
import { logError } from "../../utils/errorHandler.ts";

/**
 * Ensures Top10 content has product data placeholders
 */
export function enhanceTop10Content(parsedContent: any): any {
  console.log(`🔄 Ensuring product data placeholders in Top10 content`);
  try {
    // First check if content already contains placeholders
    if (!parsedContent || !parsedContent.content) {
      console.log(`⚠️ Invalid parsed content object, returning unmodified content`);
      return parsedContent || { 
        title: 'Top 10 List',
        content: 'Error: Unable to generate content',
        excerpt: 'Error in content generation',
        category: 'Top10',
        tags: ['error']
      };
    }
    
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
          const placeholderTag = `<div class="product-placeholder" data-product-id="${productNum}">[PRODUCT_DATA_${productNum}]</div>`;
          
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
  } catch (error) {
    logError(error, 'Error enhancing Top10 content');
    // Return the original content if enhancing fails, don't break the flow
    return parsedContent || { 
      title: 'Top 10 List',
      content: 'Error: Unable to process content',
      excerpt: 'Error in content enhancement',
      category: 'Top10',
      tags: ['error']
    };
  }
}
