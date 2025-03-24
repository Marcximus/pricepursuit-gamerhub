
/**
 * Strategy for replacing explicit product placeholders in Top10 blog posts
 */
import { generateProductHtml } from '../../generators/productGenerator';

/**
 * Replace explicit placeholders like [PRODUCT_DATA_1] with actual product HTML
 * @param content The content with placeholders
 * @param products Array of product data
 * @returns Updated content with product HTML and replacement count
 */
export function replaceExplicitPlaceholders(
  content: string,
  products: any[]
): { content: string; replacementsCount: number } {
  console.log('🔍 Looking for explicit product placeholders...');
  
  // If no products are available, return the original content
  if (!products || products.length === 0) {
    console.warn('⚠️ No products available for explicit placeholder replacement');
    return { content, replacementsCount: 0 };
  }
  
  // Check if there are explicit placeholders like [PRODUCT_DATA_1]
  const placeholderRegex = /\[PRODUCT_DATA_(\d+)\]/g;
  let newContent = content;
  let replacementsCount = 0;
  let match;
  
  // Store each match and then process them to avoid regex loop issues
  const matches = [];
  while ((match = placeholderRegex.exec(content)) !== null) {
    matches.push({ 
      fullMatch: match[0],
      numberStr: match[1],
      index: match.index
    });
  }
  
  console.log(`🔍 Found ${matches.length} explicit product placeholders`);
  
  // Process each placeholder match
  matches.forEach(match => {
    const productIndex = parseInt(match.numberStr, 10) - 1;
    
    // Ensure valid product index
    if (productIndex >= 0 && productIndex < products.length) {
      // Generate the product HTML - index passed here defines rank (10 to 1)
      const productHtml = generateProductHtml(products[productIndex], productIndex);
      
      // Replace the placeholder with the product HTML
      newContent = newContent.replace(match.fullMatch, productHtml);
      replacementsCount++;
      
      console.log(`✅ Replaced product placeholder ${match.numberStr}`);
    } else {
      console.warn(`⚠️ Invalid product index ${productIndex} for placeholder ${match.fullMatch}`);
    }
  });
  
  console.log(`✅ Replaced ${replacementsCount} explicit product placeholders`);
  return { content: newContent, replacementsCount };
}
